(async function () {
  try {
    const bootEl = document.getElementById('bootstrap');
    let url;
    let payload;

    if (bootEl && bootEl.textContent) {
      try {
        const boot = JSON.parse(bootEl.textContent);
        url = boot && typeof boot.url === 'string' ? boot.url : undefined;
        payload = boot && typeof boot.payload === 'string' ? boot.payload : undefined;
      } catch (e) {
        // handled below.
      }
    }

    const statusEl = document.getElementById('status');
    const log = (msg) => {
      try {
        console.log('[CazicExchange] success.', msg);
      } catch {
        // ignore.
      }
      if (statusEl) statusEl.textContent += `\n${msg}`;
    };

    log(`Callback url: ${String(url)}`);
    log(`Payload bytes: ${payload ? String(payload).length : 0}`);

    if (!url || !payload) {
      log('Missing url/payload; nothing to send.');
      return;
    }

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'text/plain' });
      const ok = navigator.sendBeacon(url, blob);
      log(`sendBeacon called; returned: ${String(ok)}`);
      return;
    }

    log('sendBeacon not available; falling back to fetch(no-cors).');
    await fetch(url, { method: 'POST', mode: 'no-cors', body: payload });
    log('fetch(no-cors) completed (response is opaque by design).');
  } catch (_e) {
    try {
      console.error('[CazicExchange success] Forwarding failed:', _e);
    } catch {
      // ignore.
    }

    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent += `\n${String(_e)}`;
  }
})();
