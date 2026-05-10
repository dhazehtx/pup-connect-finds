/**
 * Quick smoke checks for payment-related HTTP endpoints against a running API.
 * Usage: PAYMENTS_VERIFY_BASE_URL=http://127.0.0.1:3017 npx tsx scripts/payments-launch-smoke.ts
 */
import process from "node:process";

async function main() {
  const base = (process.env.PAYMENTS_VERIFY_BASE_URL || "http://127.0.0.1:3017").replace(/\/$/, "");
  const report: Record<string, string> = {};

  async function ping(path: string): Promise<{ ok: boolean; status: number; body: unknown }> {
    const url = `${base}${path}`;
    const res = await fetch(url).catch(() => null as any);
    if (!res)
      return { ok: false, status: -1, body: { error: "fetch_failed" } };
    const ctype = res.headers.get("content-type") || "";
    const body =
      ctype.includes("application/json") ?
        await res.json().catch(() => ({}))
      : await res.text();
    return { ok: res.ok, status: res.status, body };
  }

  report.pupbox = "pending";
  const pup = await ping("/api/pupbox/plans");
  report.pupbox =
    pup.ok ? `PASS http ${pup.status}` : `FAIL http ${pup.status} (${JSON.stringify(pup.body)})`;

  // Public products list (often unauthenticated GET)
  report.products = "pending";
  const prod = await ping("/api/products");
  report.products =
    prod.ok ? `PASS http ${prod.status}` : `WARN http ${prod.status} (${JSON.stringify(prod.body)})`;

  const cfg = await fetch(`${base}/api/payments/config`, { credentials: "include" }).catch(() => null as any);
  report.paymentsConfig =
    cfg && cfg.ok ?
      `PASS http ${cfg.status}`
    : `SKIP /api/payments/config (needs auth cookie or returns ${cfg?.status})`;

  const overallFail = Object.values(report).some((x) => x.startsWith("FAIL"));
  console.log(JSON.stringify({ base, checks: report, overall: overallFail ? "WARN|FAIL" : "OK" }, null, 2));
  process.exitCode = overallFail ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
