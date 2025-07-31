// Server-side admin logging utility
export async function logNav(event: string) {
  try {
    // TODO: Implement server-side admin logging if needed
    // For now, just a placeholder to prevent import errors
    console.log('[admin log]', event);
  } catch (err: any) {
    // swallow 401/404 – just warn
    console.warn("[admin log] skipped:", err?.message || 'Unknown error');
  }
}