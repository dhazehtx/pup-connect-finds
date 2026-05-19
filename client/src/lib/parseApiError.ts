/** Parse API error messages (including JSON bodies embedded in Error.message). */
export function parseApiErrorMessage(error: unknown): { message: string; code?: string } {
  const raw = error instanceof Error ? error.message : String(error);
  const codeFromErr = (error as { code?: string })?.code;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        error?: string;
        code?: string;
        detail?: string;
        message?: string;
      };
      const parts = [parsed.error, parsed.message, parsed.detail].filter(Boolean);
      return {
        message: parts.join(' — ') || raw,
        code: parsed.code || codeFromErr,
      };
    }
  } catch {
    /* ignore */
  }
  return { message: raw, code: codeFromErr };
}
