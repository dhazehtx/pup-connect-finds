type EnvCheck = {
  key: string;
  required: boolean;
  present: boolean;
};

const REQUIRED_KEYS = [
  "DATABASE_URL",
];

const RECOMMENDED_KEYS = [
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

export function validateStartupConfig() {
  const checks: EnvCheck[] = [
    ...REQUIRED_KEYS.map((key) => ({ key, required: true, present: Boolean(process.env[key]) })),
    ...RECOMMENDED_KEYS.map((key) => ({ key, required: false, present: Boolean(process.env[key]) })),
  ];

  const missingRequired = checks.filter((c) => c.required && !c.present).map((c) => c.key);
  const missingRecommended = checks.filter((c) => !c.required && !c.present).map((c) => c.key);

  return {
    ok: missingRequired.length === 0,
    checks,
    missingRequired,
    missingRecommended,
  };
}

