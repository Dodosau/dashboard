/**
 * main.js
 * Charge les scripts widgets APRÈS injection HTML (include.js),
 * puis appelle initX().
 */

(() => {
  const WIDGET_SCRIPTS = [
    "js/widget/clock.js",
    "js/widget/weather.js",
    "js/widget/wedding.js",
    "js/widget/bus.js",
    "js/widget/calendar.js",
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(s);
    });
  }

  async function boot() {
    // attendre include.js
    if (!window.__WIDGETS_READY__) {
      await new Promise((resolve) =>
        window.addEventListener("widgets:ready", resolve, { once: true })
      );
    }

    // charger scripts
    for (const src of WIDGET_SCRIPTS) {
      try {
        await loadScript(src);
      } catch (err) {
        console.error("❌ Widget script error:", err);
      }
    }

    // init
    try { window.initClock?.(); } catch (e) { console.error(e); }
    try { window.initWeather?.(); } catch (e) { console.error(e); }
    try { window.initWedding?.(); } catch (e) { console.error(e); }
    try { window.initBus?.(); } catch (e) { console.error(e); }
    try { window.initCalendar?.(); } catch (e) { console.error(e); }

    console.log("✅ Dashboard ready");
  }

  boot();
})();
