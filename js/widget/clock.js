// js/widget/clock.js
export function initClock(root = document) {
  const elTime = root.querySelector('[data-clock="time"]');
  const elDate = root.querySelector('[data-clock="date"]');

  if (!elTime || !elDate) {
    console.warn("[clock] éléments manquants (data-clock).");
    return;
  }

  const fmtTime = new Intl.DateTimeFormat("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fmtDate = new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let lastDayKey = "";

  function render() {
    const now = new Date();
    elTime.textContent = fmtTime.format(now);

    // clé simple pour détecter changement de jour
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      elDate.textContent = fmtDate.format(now);
    }
  }

  render();
  // time update (chaque 10s suffit largement)
  setInterval(render, 10_000);
}
