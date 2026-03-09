import type { VercelRequest, VercelResponse } from '@vercel/node';

import { requireEnv } from '../../src/env.js';

interface TokenRequestBody {
  code: string;
  code_verifier: string;
  redirect_uri: string;
}

function validateEnv(): { clientId: string; clientSecret: string } {
  return {
    clientId: requireEnv('SOUNDCLOUD_CLIENT_ID'),
    clientSecret: requireEnv('SOUNDCLOUD_CLIENT_SECRET'),
  };
}

function validateBody(body: Partial<TokenRequestBody>): TokenRequestBody {
  const { code, code_verifier, redirect_uri } = body;

  if (!code || typeof code !== 'string') throw new TypeError('Missing/invalid field: `code`');
  if (!code_verifier || typeof code_verifier !== 'string') throw new TypeError('Missing/invalid field: `code_verifier`');
  if (!redirect_uri || typeof redirect_uri !== 'string') throw new TypeError('Missing/invalid field: `redirect_uri`');

  return { code, code_verifier, redirect_uri };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let env: ReturnType<typeof validateEnv>;
  try {
    env = validateEnv();
  } catch (err) {
    console.error('[CazicExchange] Environment misconfiguration:', err);
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  let body: TokenRequestBody;
  try {
    body = validateBody(req.body ?? {});
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid request body.',
      detail: err instanceof TypeError ? err.message : 'Unknown validation error.',
    });
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.clientId,
    client_secret: env.clientSecret,
    code: body.code,
    code_verifier: body.code_verifier,
    redirect_uri: body.redirect_uri,
  });

  let response: Response;
  try {
    response = await fetch('https://secure.soundcloud.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch (err) {
    console.error('[CazicExchange] Failed to reach SoundCloud:', err);
    return res.status(502).json({ error: 'Failed to contact SoundCloud.' });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    console.error('[CazicExchange] SoundCloud returned a non-JSON response, status:', response.status);
    return res.status(502).json({ error: 'Invalid response from SoundCloud.' });
  }

  return res.status(response.status).json(data);
}
