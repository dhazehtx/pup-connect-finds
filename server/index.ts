import { debugApiLog, debugApiWarn } from './lib/debugApi';
import "./env/loadEnvEntry";
import type { Server } from "http";
import express, { type Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeSentry, Sentry, captureError } from "./utils/sentry";
import { ensureProviderIdBucket, ensureMediaBuckets } from "./lib/ensureStorageBucket";
import {
  runStartupSupabaseHealthCheck,
  startSupabaseHealthMonitor,
  getSupabaseHealthSnapshot,
} from "./lib/supabaseResilience";
import { validateStartupConfig } from "./lib/startupConfig";

// Initialize Sentry as early as possible
initializeSentry();

const app = express();
// Behind Railway/Render reverse proxy so req.ip and rate-limit keys are per-client, not "unknown".
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// DEV CSP — relaxes things so Supabase/Stripe/Replit work
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.supabase.co https://cdn.jsdelivr.net https://*.replit.com",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co wss://replit.com wss://*.replit.com https://*.replit.com",
  "img-src 'self' data: blob: https://*.stripe.com https://*.supabase.co",
  "style-src 'self' 'unsafe-inline'",
  "frame-src https://js.stripe.com https://hooks.stripe.com"
].join('; ');

app.use((req, res, next) => {
  // only set in dev; we'll tighten for prod later
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Content-Security-Policy', DEV_CSP);
  }
  next();
});

app.use((req, res, next) => {
  const requestId = req.header("x-request-id") || randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `[req:${requestId}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);

      if (duration > 800) {
        debugApiLog('[PROOF:SLOW]', JSON.stringify({ route: `${req.method} ${path}`, ms: duration, ts: Date.now() }));
      }
    }
  });

  next();
});

(async () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const seedsEnabled = nodeEnv !== 'production';
  if (nodeEnv !== 'production') {
    debugApiLog('[PROOF:ENV]', JSON.stringify({ nodeEnv, seedsEnabled, ts: Date.now() }));
  }

  const startupConfig = validateStartupConfig();
  if (!startupConfig.ok) {
    console.error(
      `[StartupConfig] Missing required env keys: ${startupConfig.missingRequired.join(", ")}. Server may fail.`,
    );
  }
  if (startupConfig.missingRecommended.length > 0) {
    console.warn(
      `[StartupConfig] Missing recommended env keys: ${startupConfig.missingRecommended.join(", ")}.`,
    );
  }

  // Supabase guardrail: detect paused/unhealthy state early, but never block boot.
  await runStartupSupabaseHealthCheck();
  startSupabaseHealthMonitor(60000);

  // Ensure storage bucket exists for provider ID documents
  try {
    const supabaseState = getSupabaseHealthSnapshot();
    if (supabaseState.mode === "degraded") {
      console.warn(
        `[Startup] Supabase degraded (reason="${supabaseState.lastError || "unknown"}"); still attempting storage bucket ensure.`,
      );
    }
    await ensureProviderIdBucket();
    await ensureMediaBuckets();
  } catch (error) {
    const supabaseState = getSupabaseHealthSnapshot();
    console.error(
      `[Startup] Failed to ensure storage bucket (mode=${supabaseState.mode}). Continuing in degraded mode:`,
      error,
    );
  }

  // Validate Stripe key/mode configuration on boot (never logs key material).
  try {
    const { validateStripeKeyMode, APP_ENV } = await import("./lib/config");
    const problems = validateStripeKeyMode();
    if (problems.length > 0) {
      console.error(`[Startup] Stripe configuration problems (mode=${APP_ENV}):`);
      for (const p of problems) console.error(`  - ${p}`);
    } else {
      console.log(`[Startup] Stripe key/mode validation passed (mode=${APP_ENV}).`);
    }
  } catch (e) {
    console.error("[Startup] Stripe config validation failed to run:", e);
  }

  const server = await registerRoutes(app);

  // Sentry error handling middleware (only if initialized)
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.expressErrorHandler());
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    debugApiLog('[PROOF:ERR]', JSON.stringify({
      route: `${_req.method} ${_req.url}`,
      code: err.code || status,
      stack: (err.stack || '').split('\n').slice(0, 3).join(' | '),
      ts: Date.now()
    }));

    captureError(err, {
      url: _req.url,
      method: _req.method,
      status
    });

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Default 3000 (local); set PORT=5000 on Replit. If the port is busy, try the next candidate.
  const host = process.env.HOST || "0.0.0.0";
  const fromEnv = Number(process.env.PORT);
  const preferred =
    Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 3000;
  /** Uncommon port first when PUP_DEV_PORT set — avoids fighting stale node on 3000–5001 */
  const altFirst =
    Number(process.env.PUP_DEV_PORT) > 0 ? Number(process.env.PUP_DEV_PORT) : null;
  const extraFallbacks = [
    3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015,
    4000, 4040, 8080, 8765, 8888, 9000,
  ];
  const candidates = [
    ...(altFirst != null ? [altFirst] : []),
    preferred,
    3000, 3001, 3002, 5000, 5001,
    ...extraFallbacks,
  ].filter((p, i, a) => a.indexOf(p) === i);

  function listenOnce(httpServer: Server, port: number, listenHost: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const onError = (err: NodeJS.ErrnoException) => {
        cleanup();
        reject(err);
      };
      const onListening = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        httpServer.removeListener("error", onError);
        httpServer.removeListener("listening", onListening);
      };
      httpServer.once("error", onError);
      httpServer.once("listening", onListening);
      httpServer.listen(port, listenHost);
    });
  }

  let bound = false;
  for (const port of candidates) {
    try {
      await listenOnce(server, port, host);
      bound = true;
      const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
      const url = `http://${displayHost}:${port}`;
      if (port !== preferred) {
        console.warn(
          `[server] Port ${preferred} was busy or skipped; using ${port}. Paste this into Cursor Simple Browser: ${url}`,
        );
      }
      log(`serving on ${url}`);
      console.log(
        `\n  ▶ Open app: ${url}\n  (Cursor: Simple Browser → paste URL above)\n`,
      );
      if (process.env.DEV_OPEN === "1" && process.platform === "darwin") {
        try {
          const { execFileSync } = await import("child_process");
          execFileSync("open", [url], { stdio: "ignore" });
        } catch {
          /* ignore */
        }
      }
      break;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === "EADDRINUSE") {
        console.warn(`[server] port ${port} in use, trying next…`);
        continue;
      }
      console.error("[server] listen failed:", code, (err as Error)?.message);
      process.exit(1);
    }
  }

  if (!bound) {
    console.error("[server] No free port in candidate list — dev server did not start.");
    console.error(
      `[server] Cursor's browser will stay blank until a server is listening. Free ports or run: PUP_DEV_PORT=8765 npm run dev`,
    );
    console.error(`[server] See what's listening (macOS):  lsof -nP -iTCP:${preferred} -sTCP:LISTEN`);
    process.exit(1);
  }
})();
