/** Read DATABASE_URL from env (Neon alias not used). */
export function readDatabaseUrlEnv(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}
