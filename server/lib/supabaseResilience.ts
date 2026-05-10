import { supabaseAdmin } from "./supabaseAdmin";

type SupabaseMode = "healthy" | "degraded" | "unknown";

type CheckResult = {
  ok: boolean;
  mode: SupabaseMode;
  reason?: string;
  latencyMs?: number;
};

type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  opName?: string;
};

type SupabaseHealthState = {
  mode: SupabaseMode;
  initialized: boolean;
  lastCheckedAt: string | null;
  lastHealthyAt: string | null;
  lastError: string | null;
  lastLatencyMs: number | null;
  consecutiveFailures: number;
  monitorEnabled: boolean;
};

const state: SupabaseHealthState = {
  mode: "unknown",
  initialized: false,
  lastCheckedAt: null,
  lastHealthyAt: null,
  lastError: null,
  lastLatencyMs: null,
  consecutiveFailures: 0,
  monitorEnabled: false,
};

let monitorHandle: NodeJS.Timeout | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function updateStateFromResult(result: CheckResult) {
  state.initialized = true;
  state.mode = result.mode;
  state.lastCheckedAt = new Date().toISOString();
  if (result.latencyMs != null) {
    state.lastLatencyMs = result.latencyMs;
  }

  if (result.ok) {
    state.lastError = null;
    state.lastHealthyAt = state.lastCheckedAt;
    state.consecutiveFailures = 0;
  } else {
    state.lastError = result.reason || "unknown error";
    state.consecutiveFailures += 1;
  }
}

export function getSupabaseHealthSnapshot() {
  return { ...state };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLikelyTransientSupabaseError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("fetch failed") ||
    m.includes("enotfound") ||
    m.includes("econnrefused") ||
    m.includes("connect timeout") ||
    m.includes("network") ||
    m.includes("timeout")
  );
}

export function isSupabaseDegraded(): boolean {
  return state.mode === "degraded";
}

export async function runSupabaseWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const opName = options.opName ?? "supabase_op";
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const message = error?.message || String(error);
      const transient = isLikelyTransientSupabaseError(message);
      if (!transient || attempt === retries) break;
      await wait(baseDelayMs * Math.pow(2, attempt));
    }
  }

  const msg = (lastError as any)?.message || String(lastError);
  const reason = `${opName}: ${msg}`;
  updateStateFromResult({ ok: false, mode: "degraded", reason });
  const err = new Error(reason) as Error & { code?: string; degraded?: boolean };
  err.code = "SUPABASE_DEGRADED";
  err.degraded = true;
  throw err;
}

export async function checkSupabaseHealth(context = "runtime"): Promise<CheckResult> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    const result: CheckResult = {
      ok: false,
      mode: "degraded",
      reason: "SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing",
    };
    updateStateFromResult(result);
    return result;
  }

  const started = Date.now();
  try {
    const [authRes, storageRes] = await Promise.all([
      withTimeout(supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 }), 8000),
      withTimeout(supabaseAdmin.storage.listBuckets(), 8000),
    ]);

    if (authRes.error) {
      throw new Error(`auth health failed: ${authRes.error.message}`);
    }
    if (storageRes.error) {
      throw new Error(`storage health failed: ${storageRes.error.message}`);
    }

    const result: CheckResult = {
      ok: true,
      mode: "healthy",
      latencyMs: Date.now() - started,
    };
    updateStateFromResult(result);
    return result;
  } catch (error: any) {
    const reason = `${context}: ${error?.message || String(error)}`;
    const result: CheckResult = {
      ok: false,
      mode: "degraded",
      reason,
      latencyMs: Date.now() - started,
    };
    updateStateFromResult(result);
    return result;
  }
}

export async function runStartupSupabaseHealthCheck() {
  const beforeMode = state.mode;
  const result = await checkSupabaseHealth("startup");
  if (result.ok) {
    console.log(`[SupabaseGuard] Healthy at startup (${result.latencyMs}ms).`);
  } else {
    console.warn(
      `[SupabaseGuard] Degraded at startup. Boot continues in degraded mode. reason="${result.reason}"`,
    );
  }
  if (beforeMode !== state.mode) {
    console.log(`[SupabaseGuard] Mode: ${beforeMode} -> ${state.mode}`);
  }
  return result;
}

export function startSupabaseHealthMonitor(intervalMs = 60000) {
  if (monitorHandle) return;
  state.monitorEnabled = true;
  monitorHandle = setInterval(async () => {
    const prevMode = state.mode;
    const result = await checkSupabaseHealth("monitor");
    if (result.ok && prevMode !== "healthy") {
      console.log(`[SupabaseGuard] Recovered to healthy (${result.latencyMs}ms).`);
    } else if (!result.ok && prevMode !== "degraded") {
      console.warn(`[SupabaseGuard] Entered degraded mode. reason="${result.reason}"`);
    }
  }, intervalMs);
  monitorHandle.unref();
}

