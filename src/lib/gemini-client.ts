export function getGeminiApiKey(): string {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set');
  return key;
}

function getPreferredModel(): string {
  try {
    const resolved = typeof window !== 'undefined' ? window.sessionStorage.getItem('ecosnap_gemini_model') : null;
    if (resolved) return resolved;
  } catch {}
  return (import.meta as any).env?.VITE_GEMINI_MODEL || import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
}

function setResolvedModel(model: string) {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('ecosnap_gemini_model', model);
    }
  } catch {}
}

function buildUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

export async function geminiGenerate(body: any): Promise<Response> {
  const apiKey = getGeminiApiKey();
  let model = getPreferredModel();

  // First attempt
  let res = await fetch(buildUrl(model, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) return res;

  // If 400 (often invalid/unsupported model), try fallback
  if (res.status === 400) {
    const fallback = 'gemini-2.0-flash';
    if (model !== fallback) {
      setResolvedModel(fallback);
      model = fallback;
      res = await fetch(buildUrl(model, apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
  }

  return res;
}
