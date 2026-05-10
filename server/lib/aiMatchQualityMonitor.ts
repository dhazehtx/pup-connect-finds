// @ts-nocheck
import { db } from '../db';
import { aiMatchQualityAlerts, aiMatchQualityDailyMetrics, aiMatchQualityEvents } from '@shared/schema';
import { and, gte, lt, sql } from 'drizzle-orm';
import { sendEmail } from './sendEmail';

type MatchRanking = 'visual' | 'proximity' | 'empty';

type RecordAiMatchEventInput = {
  matchRanking: MatchRanking;
  hadQueryEmbedding: boolean;
  resultCount: number;
  topMatchScore: number | null;
  listingThreshold: number;
  durationMs: number;
  model: string;
};

const DEFAULT_MIN_REQUESTS = 20;
const DEFAULT_MAX_FALLBACK_RATE = 0.4;
const DEFAULT_MAX_EMPTY_RATE = 0.25;
const DEFAULT_MIN_AVG_TOP_SCORE = 0.62;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const ALERT_EMAIL_SUBJECT = '[Pup Connect] AI Match quality alert';

let monitorStarted = false;
let lastEvaluatedDayKey: string | null = null;

function parseEnvNumber(raw: string | undefined, fallback: number): number {
  const val = Number(raw);
  if (!Number.isFinite(val)) return fallback;
  return val;
}

function getMonitorConfig() {
  return {
    minRequests: Math.max(1, Math.floor(parseEnvNumber(process.env.AI_MATCH_MONITOR_MIN_REQUESTS, DEFAULT_MIN_REQUESTS))),
    maxFallbackRate: Math.min(
      1,
      Math.max(0, parseEnvNumber(process.env.AI_MATCH_MONITOR_MAX_FALLBACK_RATE, DEFAULT_MAX_FALLBACK_RATE)),
    ),
    maxEmptyRate: Math.min(1, Math.max(0, parseEnvNumber(process.env.AI_MATCH_MONITOR_MAX_EMPTY_RATE, DEFAULT_MAX_EMPTY_RATE))),
    minAvgTopScore: Math.min(
      1,
      Math.max(0, parseEnvNumber(process.env.AI_MATCH_MONITOR_MIN_AVG_TOP_SCORE, DEFAULT_MIN_AVG_TOP_SCORE)),
    ),
  };
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function previousUtcDayRange(reference = new Date()): { dayStart: Date; dayEnd: Date } {
  const todayStart = startOfUtcDay(reference);
  const dayEnd = todayStart;
  const dayStart = new Date(dayEnd.getTime() - 24 * 60 * 60 * 1000);
  return { dayStart, dayEnd };
}

export async function recordAiMatchEvent(input: RecordAiMatchEventInput): Promise<void> {
  try {
    await db.insert(aiMatchQualityEvents).values({
      match_ranking: input.matchRanking,
      had_query_embedding: input.hadQueryEmbedding,
      result_count: Math.max(0, Math.floor(input.resultCount)),
      top_match_score: input.topMatchScore,
      listing_threshold: input.listingThreshold,
      duration_ms: Math.max(0, Math.floor(input.durationMs)),
      model: input.model,
    });
  } catch {
    // Never block API responses due to monitoring failures.
  }
}

type MetricRollup = {
  total_requests: number;
  visual_requests: number;
  fallback_requests: number;
  empty_requests: number;
  avg_top_match_score: number | null;
  fallback_rate: number;
  empty_rate: number;
};

async function rollupDailyMetrics(dayStart: Date, dayEnd: Date): Promise<MetricRollup> {
  const rows = await db
    .select({
      total_requests: sql<number>`COUNT(*)::int`,
      visual_requests: sql<number>`COALESCE(SUM(CASE WHEN ${aiMatchQualityEvents.match_ranking} = 'visual' THEN 1 ELSE 0 END), 0)::int`,
      fallback_requests: sql<number>`COALESCE(SUM(CASE WHEN ${aiMatchQualityEvents.match_ranking} = 'proximity' THEN 1 ELSE 0 END), 0)::int`,
      empty_requests: sql<number>`COALESCE(SUM(CASE WHEN ${aiMatchQualityEvents.match_ranking} = 'empty' THEN 1 ELSE 0 END), 0)::int`,
      avg_top_match_score: sql<number | null>`AVG(${aiMatchQualityEvents.top_match_score})`,
    })
    .from(aiMatchQualityEvents)
    .where(and(gte(aiMatchQualityEvents.created_at, dayStart), lt(aiMatchQualityEvents.created_at, dayEnd)));

  const row = rows[0] ?? {
    total_requests: 0,
    visual_requests: 0,
    fallback_requests: 0,
    empty_requests: 0,
    avg_top_match_score: null,
  };
  const total = row.total_requests || 0;
  const fallbackRate = total > 0 ? row.fallback_requests / total : 0;
  const emptyRate = total > 0 ? row.empty_requests / total : 0;
  return {
    ...row,
    fallback_rate: fallbackRate,
    empty_rate: emptyRate,
  };
}

async function createThresholdAlerts(dayStart: Date, metrics: MetricRollup): Promise<void> {
  const cfg = getMonitorConfig();
  if (metrics.total_requests < cfg.minRequests) return;

  const alerts: Array<{ alertType: string; message: string; details: Record<string, unknown> }> = [];

  if (metrics.fallback_rate > cfg.maxFallbackRate) {
    alerts.push({
      alertType: 'high_fallback_rate',
      message: `AI Match fallback rate ${metrics.fallback_rate.toFixed(2)} exceeded ${cfg.maxFallbackRate.toFixed(2)}.`,
      details: { fallback_rate: metrics.fallback_rate, threshold: cfg.maxFallbackRate, total_requests: metrics.total_requests },
    });
  }
  if (metrics.empty_rate > cfg.maxEmptyRate) {
    alerts.push({
      alertType: 'high_empty_rate',
      message: `AI Match empty-result rate ${metrics.empty_rate.toFixed(2)} exceeded ${cfg.maxEmptyRate.toFixed(2)}.`,
      details: { empty_rate: metrics.empty_rate, threshold: cfg.maxEmptyRate, total_requests: metrics.total_requests },
    });
  }
  if (metrics.avg_top_match_score != null && metrics.avg_top_match_score < cfg.minAvgTopScore) {
    alerts.push({
      alertType: 'low_avg_top_score',
      message: `AI Match avg top score ${metrics.avg_top_match_score.toFixed(2)} fell below ${cfg.minAvgTopScore.toFixed(2)}.`,
      details: {
        avg_top_match_score: metrics.avg_top_match_score,
        threshold: cfg.minAvgTopScore,
        total_requests: metrics.total_requests,
      },
    });
  }

  for (const alert of alerts) {
    await db
      .insert(aiMatchQualityAlerts)
      .values({
        metric_day: dayStart,
        alert_type: alert.alertType,
        severity: 'warn',
        message: alert.message,
        details: alert.details,
      })
      .onConflictDoNothing({
        target: [aiMatchQualityAlerts.metric_day, aiMatchQualityAlerts.alert_type],
      });
    console.warn('[AI_MATCH_MONITOR]', alert.message);
    await deliverQualityAlert(alert.message, alert.details);
  }
}

function getAlertEmails(): string[] {
  return (process.env.AI_MATCH_MONITOR_ALERT_EMAILS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Payload works with Slack (`text`) and Discord (`content`) incoming webhooks. */
function webhookBody(message: string, details: Record<string, unknown>): string {
  return JSON.stringify({
    text: message,
    content: message,
    source: 'ai_match_quality_monitor',
    details,
  });
}

async function deliverWebhookAlert(message: string, details: Record<string, unknown>): Promise<void> {
  const webhookUrl = process.env.AI_MATCH_MONITOR_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: webhookBody(message, details),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('[AI_MATCH_MONITOR] webhook delivery failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[AI_MATCH_MONITOR] webhook error:', (err as Error)?.message || err);
  }
}

export type TestOutboundResult = {
  webhookConfigured: boolean;
  webhookOk: boolean | null;
  webhookStatus?: number;
  webhookError?: string;
  emailConfigured: boolean;
  emailOk: boolean | null;
  emailError?: string;
};

/** Manual test: verify webhook URL and/or SendGrid email without waiting for a threshold breach. */
export async function sendAiMatchMonitorTestOutbound(): Promise<TestOutboundResult> {
  const msg = '[test] AI Match quality monitor — outbound delivery check (safe to ignore).';
  const details = { kind: 'manual_test', at: new Date().toISOString() };
  const out: TestOutboundResult = {
    webhookConfigured: !!process.env.AI_MATCH_MONITOR_WEBHOOK_URL?.trim(),
    webhookOk: null,
    emailConfigured: getAlertEmails().length > 0 && !!process.env.SENDGRID_API_KEY,
    emailOk: null,
  };

  if (out.webhookConfigured) {
    try {
      const webhookUrl = process.env.AI_MATCH_MONITOR_WEBHOOK_URL!.trim();
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: webhookBody(msg, details),
        signal: AbortSignal.timeout(10000),
      });
      out.webhookOk = res.ok;
      out.webhookStatus = res.status;
      if (!res.ok) out.webhookError = (await res.text()).slice(0, 500);
    } catch (e) {
      out.webhookOk = false;
      out.webhookError = (e as Error)?.message || String(e);
    }
  }

  if (out.emailConfigured) {
    try {
      const ok = await sendEmail({
        to: getAlertEmails()[0]!,
        subject: ALERT_EMAIL_SUBJECT + ' (test)',
        text: `${msg}\n\n${JSON.stringify(details, null, 2)}`,
      });
      out.emailOk = ok;
      if (!ok) out.emailError = 'sendEmail returned false (check SENDGRID_API_KEY / SENDGRID_FROM)';
    } catch (e) {
      out.emailOk = false;
      out.emailError = (e as Error)?.message || String(e);
    }
  }

  return out;
}

async function deliverEmailAlert(message: string, details: Record<string, unknown>): Promise<void> {
  const recipients = getAlertEmails();
  if (recipients.length === 0) return;
  const body = `${message}\n\nDetails:\n${JSON.stringify(details, null, 2)}`;
  for (const to of recipients) {
    await sendEmail({
      to,
      subject: ALERT_EMAIL_SUBJECT,
      text: body,
    });
  }
}

async function deliverQualityAlert(message: string, details: Record<string, unknown>): Promise<void> {
  await Promise.all([deliverWebhookAlert(message, details), deliverEmailAlert(message, details)]);
}

export async function runAiMatchNightlyMonitor(now = new Date()): Promise<void> {
  const { dayStart, dayEnd } = previousUtcDayRange(now);
  const metrics = await rollupDailyMetrics(dayStart, dayEnd);

  await db
    .insert(aiMatchQualityDailyMetrics)
    .values({
      metric_day: dayStart,
      total_requests: metrics.total_requests,
      visual_requests: metrics.visual_requests,
      fallback_requests: metrics.fallback_requests,
      empty_requests: metrics.empty_requests,
      avg_top_match_score: metrics.avg_top_match_score,
      fallback_rate: metrics.fallback_rate,
      empty_rate: metrics.empty_rate,
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: aiMatchQualityDailyMetrics.metric_day,
      set: {
        total_requests: metrics.total_requests,
        visual_requests: metrics.visual_requests,
        fallback_requests: metrics.fallback_requests,
        empty_requests: metrics.empty_requests,
        avg_top_match_score: metrics.avg_top_match_score,
        fallback_rate: metrics.fallback_rate,
        empty_rate: metrics.empty_rate,
        updated_at: new Date(),
      },
    });

  await createThresholdAlerts(dayStart, metrics);
}

export function startAiMatchMonitorScheduler(): void {
  if (monitorStarted) return;
  monitorStarted = true;

  const tick = () => {
    void (async () => {
      try {
        const { dayStart } = previousUtcDayRange(new Date());
        const dayKey = dayStart.toISOString().slice(0, 10);
        if (lastEvaluatedDayKey === dayKey) return;
        await runAiMatchNightlyMonitor(new Date());
        lastEvaluatedDayKey = dayKey;
      } catch (err) {
        console.error('[AI_MATCH_MONITOR] scheduler error:', (err as Error)?.message || err);
      }
    })();
  };

  // Run once shortly after startup, then periodically.
  setTimeout(tick, 20_000);
  setInterval(tick, SIX_HOURS_MS);
}

