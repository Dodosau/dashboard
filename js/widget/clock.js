// js/widget/clock.js
(() => {
  const STATE = {
    timer: null,
    mounted: false,
  };

  function qs(id) {
    return document.getElementById(id);
  }

  function fmtTime(d) {
    return d.toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function render() {
    const el = qs("clock");
    if (!el) return;
    el.textContent = fmtTime(new Date());
  }

  /**
   * initClock()
   * - Safe si appelé plusieurs fois
   * - Ne démarre rien si le DOM n'a pas l'élément attendu
   */
  function initClock() {
    const el = qs("clock");
    if (!el) {
      console.warn("[clock] #clock introuvable -> init ignoré");
      return;
    }

    // Evite double interval si init appelé 2 fois
    if (STATE.timer) clearInterval(STATE.timer);

    render(); // premier rendu immédiat
    STATE.timer = setInterval(render, 1000);
    STATE.mounted = true;

    console.log("[clock] ok");
  }

  /**
   * destroyClock()
   * - Utile si tu recharges le widget/HTML plus tard
   */
  function destroyClock() {
    if (STATE.timer) clearInterval(STATE.timer);
    STATE.timer = null;
    STATE.mounted = false;
  }

  // Expose proprement au global
  window.initClock = initClock;
  window.destroyClock = destroyClock;
})();
