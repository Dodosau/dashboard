window.initClock = function initClock() {
  const el = document.getElementById("clock");
  if (!el) return; // si l'include n'est pas encore chargé

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const d = new Date();
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  tick();
  setInterval(tick, 1000);
};
