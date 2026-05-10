import "dotenv/config";
import { spawnSync } from "node:child_process";

type Light = "GREEN" | "YELLOW" | "RED";
type Step = {
  name: string;
  command: string;
  ok: boolean;
  output: string;
};

const BASE = (process.env.MESSAGING_VERIFY_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

function run(command: string): { ok: boolean; output: string } {
  const res = spawnSync("zsh", ["-lc", command], {
    encoding: "utf8",
    env: { ...process.env, MESSAGING_VERIFY_BASE_URL: BASE },
  });
  return {
    ok: res.status === 0,
    output: `${res.stdout || ""}${res.stderr || ""}`.trim(),
  };
}

function compactOutput(output: string): string {
  return output.split("\n").slice(-12).join("\n");
}

function lightFor(ok: boolean): Light {
  return ok ? "GREEN" : "RED";
}

async function main() {
  const commands: Array<{ name: string; command: string }> = [
    { name: "Health API", command: `curl -sS "${BASE}/api/health"` },
    { name: "Supabase Health Snapshot", command: `curl -sS "${BASE}/api/health/supabase"` },
    { name: "Supabase Ops Snapshot", command: `curl -sS "${BASE}/api/ops/supabase"` },
    { name: "Booking Verify", command: "npx tsx scripts/bookings-final-verify.ts" },
    { name: "Messaging Verify", command: "npx tsx scripts/messaging-final-verify.ts" },
    { name: "Notifications Verify", command: "npx tsx scripts/notifications-launch-verify.ts" },
    { name: "Stripe Self Test", command: "npx tsx scripts/pupbox-stripe-self-test.ts" },
    { name: "Stripe Webhook E2E", command: "npx tsx scripts/stripe-webhook-e2e-proof.ts" },
  ];

  const steps: Step[] = [];
  for (const c of commands) {
    const result = run(c.command);
    steps.push({
      name: c.name,
      command: c.command,
      ok: result.ok,
      output: compactOutput(result.output),
    });
  }

  const total = steps.length;
  const passed = steps.filter((s) => s.ok).length;
  const percent = Math.round((passed / total) * 100);
  const overall: Light = percent >= 90 ? "GREEN" : percent >= 70 ? "YELLOW" : "RED";

  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    overall,
    completionPercent: percent,
    passed,
    total,
    board: steps.map((s) => ({
      name: s.name,
      light: lightFor(s.ok),
      ok: s.ok,
      command: s.command,
      output: s.output,
    })),
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!steps.every((s) => s.ok)) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("[LAUNCH_READINESS_BOARD] Fatal:", e);
  process.exitCode = 1;
});

