(() => {
  const API = "https://stm-bus.doriansauzede.workers.dev/api/next55-two?stop=52103";
  const REFRESH_MS = 15000;

  const elMain = document.getElementById("busNext");
  const elSmall = document.getElementById("busNext2"); // optionnel
  const card = elMain ? elMain.closest(".card") : null;

  function setColor(min) {
    if (!card) return;
    card.classList.remove("busGreen", "busOrange", "busRed");
    if (min == null) return;
    if (min > 10) card.classList.add("busGreen");
    else if (min >= 8) card.classList.add("busOrange");
    else card.classList.add("busRed");
  }

  async function refresh() {
    try {
      const res = await fetch(API, { cache: "no-store" });
      const data = await res.json();

      if (!data.ok) throw new Error("API not ok");

      const m1 = data.nextBusMinutes;
      const m2 = data.nextBus2Minutes;

      if (elMain) elMain.textContent = (m1 == null) ? "—" : `${m1} min`;
      setColor(m1);

      if (elSmall) elSmall.textContent = (m2 == null) ? "" : `suivant: ${m2} min`;
    } catch (e) {
      if (elMain) elMain.textContent = "STM indisponible";
      setColor(null);
      if (elSmall) elSmall.textContent = "";
    }
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
