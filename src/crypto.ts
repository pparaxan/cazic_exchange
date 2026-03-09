import crypto from 'node:crypto';

export function base64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function randomBase64Url(bytes: number): string {
  return base64Url(crypto.randomBytes(bytes));
}

export function sha256Base64Url(input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest();
  return base64Url(hash);
}

export function hmacSha256Base64Url(secret: string, data: string): string {
  const mac = crypto.createHmac('sha256', secret).update(data).digest();
  return base64Url(mac);
}
