(async function () {
  try {
    const url = window.__CAZIC_CALLBACK_URL__;
    const payload = window.__CAZIC_PAYLOAD__;

    if (!url || !payload) return;

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'text/plain' });
      navigator.sendBeacon(url, blob);
      return;
    }

    await fetch(url, { method: 'POST', mode: 'no-cors', body: payload });
  } catch (_e) {
    // noop
  }
})();
