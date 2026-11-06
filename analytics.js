(() => {
  "use strict";

  const endpoint = document
    .querySelector('meta[name="analytics-endpoint"]')
    ?.content.trim();

  // An empty endpoint keeps analytics completely disabled in development and
  // prevents accidental transmission before the private collector is deployed.
  if (!endpoint || !/^https:\/\//i.test(endpoint)) return;

  // Collection starts automatically. A browser-level Global Privacy Control
  // signal is still honored as an opt-out.
  if (navigator.globalPrivacyControl === true) return;
  startAnalytics();

  function startAnalytics() {
    const visitorId = getOrCreateId(localStorage, "shl_visitor_id");
    const sessionId = getOrCreateId(sessionStorage, "shl_session_id");
    let lastTick = performance.now();
    let wasVisible = document.visibilityState === "visible";
    let unsentActiveMs = 0;

    send("page_view", {
      visitor_id: visitorId,
      session_id: sessionId,
      path: location.pathname + location.search,
      referrer: document.referrer || ""
    });

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      let url;
      try {
        url = new URL(link.href, location.href);
      } catch {
        return;
      }

      send("link_click", {
        visitor_id: visitorId,
        session_id: sessionId,
        path: location.pathname + location.search,
        link_url: url.href,
        link_text: (link.textContent || link.getAttribute("aria-label") || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180),
        is_internal: url.origin === location.origin
      }, true);
    });

    const heartbeat = window.setInterval(() => flushActiveTime("heartbeat"), 15000);

    document.addEventListener("visibilitychange", () => {
      tick();
      if (document.visibilityState === "hidden") flushActiveTime("heartbeat", true);
      lastTick = performance.now();
    });

    window.addEventListener("pagehide", () => {
      window.clearInterval(heartbeat);
      flushActiveTime("page_leave", true);
    });

    function tick() {
      const now = performance.now();
      if (wasVisible) {
        unsentActiveMs += Math.max(0, now - lastTick);
      }
      lastTick = now;
      wasVisible = document.visibilityState === "visible";
    }

    function flushActiveTime(type, useBeacon = false) {
      tick();
      const activeSeconds = Math.floor(unsentActiveMs / 1000);
      if (activeSeconds < 1) return;
      unsentActiveMs -= activeSeconds * 1000;

      send(type, {
        visitor_id: visitorId,
        session_id: sessionId,
        path: location.pathname + location.search,
        active_seconds: Math.min(activeSeconds, 60)
      }, useBeacon);
    }
  }

  function send(eventName, data, useBeacon = false) {
    const body = JSON.stringify({ event: eventName, ...data });

    if (useBeacon && navigator.sendBeacon) {
      const queued = navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: "text/plain;charset=UTF-8" })
      );
      if (queued) return;
    }

    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body
    }).catch(() => {});
  }

  function getOrCreateId(storage, key) {
    let value = storage.getItem(key);
    if (!value) {
      value = crypto.randomUUID();
      storage.setItem(key, value);
    }
    return value;
  }
})();
