// js/bus.js (debug + affichage clair)

(() => {
  const WORKER_BASE = "https://stm-bus.doriansauzede.workers.dev"; // sans slash final
  const STOP_ID = "52103";
  const REFRESH_MS = 30_000;

  const el = document.getElementById("busNext");
  if (!el) return;

  const endpoint = `${WORKER_BASE}/api/next55?stop=${encodeURIComponent(STOP_ID)}`;

  function set(text) {
    el.textContent = text;
  }

  async function refresh() {
    set("Chargement…");

    try {
      const res = await fetch(endpoint, { cache: "no-store" });

      // Si le Worker répond mais pas en 200
      if (!res.ok) {
        set(`STM indisponible (HTTP ${res.status})`);
        return;
      }

      // Si ça répond mais pas du JSON
      let data;
      try {
        data = await res.json();
      } catch {
        const txt = await res.text();
        set(`STM indisponible (réponse non-JSON)`);
        console.log("Réponse brute:", txt);
        return;
      }

      if (!data.ok) {
        set(`STM indisponible (${data.error || "ok=false"})`);
        return;
      }

      if (data.nextBusMinutes == null) {
        set("Aucune prévision");
        return;
      }

      const m = Number(data.nextBusMinutes);
      if (!Number.isFinite(m)) {
        set("STM indisponible (minutes invalides)");
        return;
      }

      if (m <= 0) {
        set("Prochain bus: maintenant");
        return;
      }

      // Optionnel: afficher aussi l’heure prévue
      if (data.departureTimeUnix) {
        const dt = new Date(data.departureTimeUnix * 1000);
        const hh = dt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
        set(`Prochain bus dans ${m} min (${hh})`);
      } else {
        set(`Prochain bus dans ${m} min`);
      }
    } catch (e) {
      // Si fetch échoue (offline, DNS, blocked, etc.)
      set("STM indisponible (réseau)");
      console.log("fetch error:", e);
    }
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
