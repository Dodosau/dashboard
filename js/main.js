/**
 * main.js
 * Charge les scripts des widgets APRÈS injection des HTML par include.js
 */

(() => {
  // ✅ Tes scripts sont dans /js/widget/
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
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(s);
    });
  }

  async function boot() {
    // 1) Attendre que include.js ait fini d'injecter les widgets HTML
    if (!window.__WIDGETS_READY__) {
      await new Promise((resolve) =>
        window.addEventListener("widgets:ready", resolve, { once: true })
      );
    }

    // 2) Charger les scripts widgets dans l'ordre
    for (const src of WIDGET_SCRIPTS) {
      try {
        await loadScript(src);
        console.log("✅ loaded", src);
      } catch (err) {
        console.error("❌ Widget script error:", err);
      }
    }

    // 3) (Optionnel) Si certains widgets exposent des init*, on les lance ici.
    // -> Utile uniquement si tes fichiers ne sont PAS des IIFE.
    if (window.initClock) window.initClock();
    if (window.initWeather) window.initWeather();
    if (window.initWedding) window.initWedding();
    if (window.initBus) window.initBus();
    if (window.initCalendar) window.initCalendar();

    console.log("✅ Dashboard ready");
  }

  boot();
})();
