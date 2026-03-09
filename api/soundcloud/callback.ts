import type { VercelRequest, VercelResponse } from '@vercel/node';

import { clearCookie, getCookie } from '../../src/cookies.js';
import { hmacSha256Base64Url } from '../../src/crypto.js';
import { requireEnv } from '../../src/env.js';
import { readPage } from '../../src/html.js';

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeJsString(s: string): string {
  return s.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientId = requireEnv('SOUNDCLOUD_CLIENT_ID');
    const clientSecret = requireEnv('SOUNDCLOUD_CLIENT_SECRET');
    const redirectUri = requireEnv('SOUNDCLOUD_REDIRECT_URI');
    const cookieSecret = requireEnv('CAZICEX_COOKIE_SECRET');

    const code = typeof req.query.code === 'string' ? req.query.code : null;
    const state = typeof req.query.state === 'string' ? req.query.state : null;
    if (!code || !state) {
      const tpl = await readPage('failure.html');
      const html = tpl.replace('__ERROR__', escapeHtml('Missing `code` or `state`.'));
      return res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    }

    const cookieState = getCookie(req, 'cazic_sc_state');
    const verifier = getCookie(req, 'cazic_sc_verifier');
    const sig = getCookie(req, 'cazic_sc_sig');

    if (!cookieState || !verifier || !sig) {
      const tpl = await readPage('failure.html');
      const html = tpl.replace('__ERROR__', escapeHtml('Missing login session cookies. Please retry login.'));
      return res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    }

    if (cookieState !== state) {
      const tpl = await readPage('failure.html');
      const html = tpl.replace('__ERROR__', escapeHtml('State mismatch. Please retry login.'));
      return res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    }

    const expectedSig = hmacSha256Base64Url(cookieSecret, `${state}.${verifier}`);
    if (expectedSig !== sig) {
      const tpl = await readPage('failure.html');
      const html = tpl.replace('__ERROR__', escapeHtml('Invalid login session signature. Please retry login.'));
      return res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    }

    // One-time use: clear cookies early
    clearCookie(res, 'cazic_sc_state');
    clearCookie(res, 'cazic_sc_verifier');
    clearCookie(res, 'cazic_sc_sig');

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    });

    const scResp = await fetch('https://secure.soundcloud.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', accept: 'application/json; charset=utf-8' },
      body: params.toString(),
    });

    const text = await scResp.text();

    if (!scResp.ok) {
      console.error('[CazicExchange] SoundCloud token exchange failed:', scResp.status, text);
      const tpl = await readPage('failure.html');
      const html = tpl.replace('__ERROR__', escapeHtml(`SoundCloud token exchange failed (status=${scResp.status}).`));
      return res.status(502).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    }

    const cazicCallback = 'http://localhost:24114/soundcloud';
    const payload = JSON.stringify({ state, token: JSON.parse(text) });

    const tpl = await readPage('success.html');
    const html = tpl
      .replace('__CAZIC_CALLBACK_URL__', escapeJsString(cazicCallback))
      .replace('__PAYLOAD__', escapeJsString(payload));

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
  } catch (err) {
    console.error('[CazicExchange] /api/soundcloud/callback error:', err);
    try {
      const tpl = await readPage('failure.html');
      const html = tpl.replace('__ERROR__', escapeHtml('Internal server error'));
      res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch {
      res.status(500).send('Internal server error');
    }
  }
}
