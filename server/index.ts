import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeSentry, Sentry, captureError } from "./utils/sentry";
import type { Server } from "http";

// Initialize Sentry as early as possible
initializeSentry();

const app = express();
app.use(express.json());
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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

export async function setupApp(): Promise<{ app: express.Application; server: Server }> {
  const server = await registerRoutes(app);

  // Sentry error handling middleware (only if initialized)
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.expressErrorHandler());
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Capture error in Sentry
    captureError(err, {
      url: _req.url,
      method: _req.method,
      status
    });

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return { app, server };
}

export default app;
