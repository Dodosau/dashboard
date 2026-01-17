// js/bus.js
// Widget STM — Bus 55 (prochain + suivant)

(() => {
  const WORKER_BASE = "https://stm-bus.doriansauzede.workers.dev";
  const STOP_ID = "52103";

  // 🔁 refresh toutes les 15 secondes
  const REFRESH_MS = 15_000;

  const badge = document.getElementById("busNext");
  const following = document.getElementById("busFollowing");
  if (!badge) return;

  const endpoint = `${WORKER_BASE}/api/next55-two?stop=${encodeURIComponent(STOP_ID)}`;

  function setBadge(text, cls) {
    badge.textContent = text;
    badge.classList.remove("good", "warn", "bad", "na");
    badge.classList.add(cls);
  }

  // 🎨 règles de couleur demandées
  function colorClass(minutes) {
    if (minutes == null) return "na";

    if (minutes > 10) return "good";      // 🟢 plus de 10 min
    if (minutes >= 8) return "warn";      // 🟠 entre 10 et 8 min
    return "bad";                          // 🔴 moins de 8 min
  }

  async function refresh() {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) {
        setBadge("—", "na");
        if (following) following.textContent = "STM indisponible";
        return;
      }

      const data = await res.json();
      if (!data.ok) {
        setBadge("—", "na");
        if (following) following.textContent = "STM indisponible";
        return;
      }

      const m1 = data.nextBusMinutes;
      const m2 = data.nextBus2Minutes;

      if (m1 == null) {
        setBadge("—", "na");
        if (following) following.textContent = "Aucune prévision";
        return;
      }

      const n1 = Number(m1);
      const n2 = m2 == null ? null : Number(m2);

      // Badge principal
      if (n1 <= 0) {
        setBadge("Maint.", "bad");
      } else {
        setBadge(`${n1} min`, colorClass(n1));
      }

      // Texte "suivant"
      if (following) {
        if (n2 == null || !Number.isFinite(n2)) {
          following.textContent = "";
        } else {
          following.textContent = `Suivant : ${n2} min`;
        }
      }

    } catch (e) {
      setBadge("—", "na");
      if (following) following.textContent = "STM indisponible";
    }
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
