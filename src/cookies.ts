import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCookie(res: VercelResponse, name: string, value: string, maxAgeSeconds = 600): void {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (process.env.VERCEL) parts.push('Secure');

  const prev = res.getHeader('Set-Cookie');
  const next = Array.isArray(prev) ? [...prev, parts.join('; ')] : prev ? [String(prev), parts.join('; ')] : [parts.join('; ')];
  res.setHeader('Set-Cookie', next);
}

export function clearCookie(res: VercelResponse, name: string): void {
  const parts = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.VERCEL) parts.push('Secure');

  const prev = res.getHeader('Set-Cookie');
  const next = Array.isArray(prev) ? [...prev, parts.join('; ')] : prev ? [String(prev), parts.join('; ')] : [parts.join('; ')];
  res.setHeader('Set-Cookie', next);
}

export function getCookie(req: VercelRequest, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const parts = header.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
    const v = part.slice(idx + 1).trim();
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
  return null;
}
