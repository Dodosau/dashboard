// js/bus.js
// Widget STM — Bus 55 (prochain + suivant)

(() => {
  const WORKER_BASE = "https://stm-bus.doriansauzede.workers.dev";
  const STOP_ID = "52103";
  const REFRESH_MS = 30_000;

  const badge = document.getElementById("busNext");
  const following = document.getElementById("busFollowing");
  if (!badge) return;

  const endpoint = `${WORKER_BASE}/api/next55-two?stop=${encodeURIComponent(STOP_ID)}`;

  function setBadge(text, cls) {
    badge.textContent = text;
    badge.classList.remove("good", "warn", "bad", "na");
    badge.classList.add(cls);
  }

  function colorClass(minutes) {
    if (minutes == null) return "na";
    if (minutes <= 5) return "good";
    if (minutes <= 12) return "warn";
    return "bad";
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
        setBadge("Maint.", "good");
      } else {
        setBadge(`${n1} min`, colorClass(n1));
      }

      // Texte suivant
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
