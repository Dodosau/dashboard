/**
 * main.js
 * Charge les widgets (HTML via include.js) puis lance les scripts des widgets.
 * IMPORTANT: adapte les chemins à ton arborescence (ici: js/widget/*.js)
 */

(() => {
  // Scripts widgets à charger après injection HTML
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
    // 1) Attendre que include.js ait injecté tous les widgets HTML
    if (!window.__WIDGETS_READY__) {
      await new Promise((resolve) =>
        window.addEventListener("widgets:ready", resolve, { once: true })
      );
    }

    // 2) Charger les scripts widgets dans l'ordre
    for (const src of WIDGET_SCRIPTS) {
      try {
        await loadScript(src);
      } catch (err) {
        console.error("❌ Widget script error:", err);
      }
    }

    console.log("✅ Dashboard ready");
  }

  // Lancer quand le DOM est prêt (sécurité)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
