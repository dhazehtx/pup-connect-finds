import { Router, type Request, type Response } from "express";
import * as Sentry from "@sentry/node";
import { getSentryEnvironment } from "../utils/sentry";

const router = Router();

function allowTestError(req: Request): boolean {
  const isProd = process.env.NODE_ENV === "production";
  const expected = process.env.SENTRY_TEST_SECRET?.trim();
  const got = String(
    req.headers["x-sentry-test-secret"] ||
      req.headers["authorization"]?.replace(/^Bearer\s+/i, "") ||
      "",
  ).trim();

  if (isProd) {
    if (!expected) return false;
    return got === expected;
  }
  if (expected && got !== expected) return false;
  return true;
}

/** POST — sends one intentional error to Sentry (requires secret in production). */
router.post("/test-error", (req: Request, res: Response) => {
  if (!allowTestError(req)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (!process.env.SENTRY_DSN) {
    console.warn("[Sentry] test-error: SENTRY_DSN not set; nothing sent");
    res.status(503).json({
      ok: false,
      reported: false,
      reason: "sentry_not_configured",
    });
    return;
  }

  const err = new Error("Sentry test error (intentional)");
  Sentry.captureException(err, {
    tags: { source: "sentry-test-endpoint" },
    level: "error",
  });

  console.log("[Sentry] test-error: captureException dispatched");

  res.json({
    ok: true,
    reported: true,
    message: "Test error sent to Sentry",
  });
});

/** GET — whether Sentry is configured and current environment label (no secrets). */
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    sentry: {
      enabled: !!process.env.SENTRY_DSN?.trim(),
      environment: getSentryEnvironment(),
    },
  });
});

export default router;
