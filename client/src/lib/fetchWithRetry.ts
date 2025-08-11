// Robust fetch utility with timeout and retry logic
export async function fetchWithRetry(
  url: string,
  opts: RequestInit = {},
  { retries = 2, timeoutMs = 8000 } = {}
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }
      
      return await res.json();
    } catch (err) {
      clearTimeout(t);
      if (attempt === retries) throw err;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}