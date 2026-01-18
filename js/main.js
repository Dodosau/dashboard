/**
 * main.js
 * Lance les scripts des widgets
 * APRÈS que tous les widgets HTML aient été injectés.
 */

(() => {
  /**
   * Liste des scripts widgets à charger.
   * Ordre important si certains dépendent d’autres.
   */
  const WIDGET_SCRIPTS = [
    "js/clock.js",
    "js/weather.js",
    "js/wedding.js",
    "js/bus.js",
    "js/calendar.js",
  ];

  /**
   * Charge dynamiquement un script JS
   */
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

  /**
   * Démarrage de l'application
   */
  async function boot() {
    // 1️⃣ Attendre que include.js ait fini
    if (!window.__WIDGETS_READY__) {
      await new Promise((resolve) =>
        window.addEventListener("widgets:ready", resolve, { once: true })
      );
    }

    // 2️⃣ Charger les scripts widgets dans l'ordre
    for (const src of WIDGET_SCRIPTS) {
      try {
        await loadScript(src);
      } catch (err) {
        console.error("❌ Widget script error:", err);
      }
    }

    console.log("✅ Dashboard ready");
  }

  boot();
})();
