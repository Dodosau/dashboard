/**
 * include.js
 * Charge les fichiers HTML déclarés via data-include
 * et les injecte dans la page.
 *
 * Exemple dans index.html :
 * <div data-include="widgets/clock.html"></div>
 */

(async () => {
  const placeholders = document.querySelectorAll("[data-include]");

  for (const placeholder of placeholders) {
    const path = placeholder.getAttribute("data-include");

    if (!path) continue;

    try {
      const response = await fetch(path, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Remplace le placeholder par le HTML du widget
      placeholder.outerHTML = html;

    } catch (err) {
      console.error(`❌ Failed to include ${path}`, err);

      // Fallback visuel propre
      placeholder.outerHTML = `
        <div class="card">
          <div class="title">Erreur</div>
          <div class="small">Impossible de charger ${path}</div>
        </div>
      `;
    }
  }

  /**
   * Signal global : tous les widgets HTML sont maintenant dans le DOM
   * Les scripts widgets peuvent être lancés en sécurité.
   */
  window.__WIDGETS_READY__ = true;
  window.dispatchEvent(new Event("widgets:ready"));
})();
