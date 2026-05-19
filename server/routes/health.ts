import type { Express } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { profiles } from "@shared/schema";
import { checkSupabaseHealth, getSupabaseHealthSnapshot } from "../lib/supabaseResilience";
import { validateStartupConfig } from "../lib/startupConfig";

import { getServerSupabaseApiUrl } from "../lib/serverSupabaseEnv";
import { diagnoseDatabaseUrl } from "../lib/databaseUrlDiagnostics";
import { readDatabaseUrlEnv } from "../lib/readDatabaseUrlEnv";

export function registerHealthRoutes(app: Express) {
  // Liveness only — no DB. Use for PaaS health checks (Railway/Render) so a cold DB
  // or bad DATABASE_URL does not fail the deploy before you can fix variables.
  app.get("/api/health/live", (_req, res) => {
    res.status(200).json({
      ok: true,
      ts: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      dbConfigured: Boolean(
        Boolean(readDatabaseUrlEnv()),
      ),
    });
  });

  app.get("/api/ops/supabase", async (_req, res) => {
    const snapshot = getSupabaseHealthSnapshot();
    const supabaseUrl = getServerSupabaseApiUrl();
    let host: string | null = null;
    try {
      host = supabaseUrl ? new URL(supabaseUrl).hostname : null;
    } catch {
      host = null;
    }
    res.json({
      ok: snapshot.mode === "healthy",
      mode: snapshot.mode,
      host,
      env: {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      snapshot,
    });
  });

  app.get("/api/ops/config", (_req, res) => {
    const startup = validateStartupConfig();
    const dbDiag = diagnoseDatabaseUrl(readDatabaseUrlEnv());
    res.json({
      ok: startup.ok,
      missingRequired: startup.missingRequired,
      missingRecommended: startup.missingRecommended,
      checks: startup.checks,
      runtime: {
        nodeEnv: process.env.NODE_ENV || "development",
        uptimeSec: Math.round(process.uptime()),
      },
      database: dbDiag,
      supabase: getSupabaseHealthSnapshot(),
    });
  });

  app.get("/api/ops/database", (_req, res) => {
    const dbDiag = diagnoseDatabaseUrl(readDatabaseUrlEnv());
    res.json({
      ok: dbDiag.configured && dbDiag.issues.length === 0,
      diagnostics: dbDiag,
    });
  });

  // Supabase health check
  app.get("/api/health/supabase", async (req, res) => {
    try {
      const force = req.query.force === "1" || req.query.force === "true";
      if (force) {
        await checkSupabaseHealth("health_route_force");
      }
      const snapshot = getSupabaseHealthSnapshot();
      const httpStatus = snapshot.mode === "healthy" ? 200 : 503;
      res.status(httpStatus).json({
        ok: snapshot.mode === "healthy",
        mode: snapshot.mode,
        initialized: snapshot.initialized,
        monitorEnabled: snapshot.monitorEnabled,
        lastCheckedAt: snapshot.lastCheckedAt,
        lastHealthyAt: snapshot.lastHealthyAt,
        lastLatencyMs: snapshot.lastLatencyMs,
        consecutiveFailures: snapshot.consecutiveFailures,
        lastError: snapshot.lastError,
      });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  });

  // Basic health check
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection (Drizzle requires sql`` — raw strings are not valid)
      await db.execute(sql`SELECT 1`);
      
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: 'healthy',
          supabase: getSupabaseHealthSnapshot().mode,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
          }
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const dbDiag = diagnoseDatabaseUrl(readDatabaseUrlEnv());
      console.error('Health check failed:', message, dbDiag.issues.length ? dbDiag.issues : '');
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        hint:
          'Use Supabase Transaction pooler URI (port 6543) in DATABASE_URL. See DEPLOYMENT.md.',
        detail: process.env.NODE_ENV === 'production' ? undefined : message.slice(0, 200),
        databaseDiagnostics: dbDiag,
        services: {
          database: 'unhealthy',
        },
      });
    }
  });

  // Detailed health check for monitoring systems
  app.get("/api/health/detailed", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Test database query against real app schema
      await db.select({ count: sql<number>`count(*)::int` }).from(profiles);
      const dbResponseTime = Date.now() - startTime;
      const supabaseSnapshot = getSupabaseHealthSnapshot();

      // Check environment variables
      const requiredEnvVars = [
        'DATABASE_URL',
        'STRIPE_SECRET_KEY'
      ];
      
      const envStatus = requiredEnvVars.reduce((acc, envVar) => {
        acc[envVar] = !!process.env[envVar];
        return acc;
      }, {} as Record<string, boolean>);

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: {
            status: 'healthy',
            responseTime: `${dbResponseTime}ms`
          },
          supabase: {
            status: supabaseSnapshot.mode,
            initialized: supabaseSnapshot.initialized,
            lastCheckedAt: supabaseSnapshot.lastCheckedAt,
            lastHealthyAt: supabaseSnapshot.lastHealthyAt,
            lastLatencyMs: supabaseSnapshot.lastLatencyMs,
            consecutiveFailures: supabaseSnapshot.consecutiveFailures,
            lastError: supabaseSnapshot.lastError,
          },
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
            percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%'
          },
          environment: envStatus
        },
        performance: {
          databaseResponseTime: `${dbResponseTime}ms`,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      });
    } catch (error) {
      console.error('Detailed health check failed:', error);
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'unhealthy'
        }
      });
    }
  });
}