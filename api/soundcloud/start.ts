import type { VercelRequest, VercelResponse } from '@vercel/node';

import { hmacSha256Base64Url, randomBase64Url, sha256Base64Url } from '../../src/crypto';
import { setCookie } from '../../src/cookies';
import { requireEnv } from '../../src/env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientId = requireEnv('SOUNDCLOUD_CLIENT_ID');
    const redirectUri = requireEnv('SOUNDCLOUD_REDIRECT_URI');
    const cookieSecret = requireEnv('CAZICEX_COOKIE_SECRET');

    const state = randomBase64Url(16);
    const codeVerifier = randomBase64Url(48);
    const codeChallenge = sha256Base64Url(codeVerifier);

    const sig = hmacSha256Base64Url(cookieSecret, `${state}.${codeVerifier}`);

    setCookie(res, 'cazic_sc_state', state);
    setCookie(res, 'cazic_sc_verifier', codeVerifier);
    setCookie(res, 'cazic_sc_sig', sig);

    const authorize = new URL('https://secure.soundcloud.com/authorize');
    authorize.searchParams.set('client_id', clientId);
    authorize.searchParams.set('redirect_uri', redirectUri);
    authorize.searchParams.set('response_type', 'code');
    authorize.searchParams.set('code_challenge', codeChallenge);
    authorize.searchParams.set('code_challenge_method', 'S256');
    authorize.searchParams.set('state', state);

    res.statusCode = 302;
    res.setHeader('Location', authorize.toString());
    res.end();
  } catch (err) {
    console.error('[CazicExchange] /api/soundcloud/start error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
