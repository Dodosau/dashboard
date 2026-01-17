// js/bus.js
// Affiche "Prochain bus dans X min" pour la STM (Bus 55) via ton Cloudflare Worker

(() => {
  // ✅ Mets ici l’URL de ton Worker (sans slash final)
  const WORKER_BASE = "https://stm-bus.doriansauzede.workers.dev";

  // Stop St-Laurent / Rachel (ton stopId confirmé)
  const STOP_ID = "52103";

  const REFRESH_MS = 30_000; // refresh toutes les 30 sec

  const el = document.getElementById("busNext");
  if (!el) return;

  function setText(text) {
    el.textContent = text;
  }

  async function refreshBus() {
    try {
      // Appel endpoint final
      const url = `${WORKER_BASE}/api/next55?stop=${encodeURIComponent(STOP_ID)}`;
      const res = await fetch(url, { cache: "no-store" });

      // Si HTTP error
      if (!res.ok) {
        setText("Erreur API");
        return;
      }

      const data = await res.json();

      // Si Worker renvoie ok:false
      if (!data.ok) {
        setText("Erreur");
        return;
      }

      // Pas de prédiction
      if (data.nextBusMinutes == null) {
        setText("Aucune prévision");
        return;
      }

      const m = Number(data.nextBusMinutes);

      if (!Number.isFinite(m)) {
        setText("—");
        return;
      }

      if (m <= 0) {
        setText("Maintenant");
        return;
      }

      setText(`Prochain bus dans ${m} min`);
    } catch (e) {
      setText("Erreur réseau");
    }
  }

  // Run + interval
  refreshBus();
  setInterval(refreshBus, REFRESH_MS);
})();
