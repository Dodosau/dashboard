(() => {
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[m]));
  }

  function fmtTodayDate() {
    return new Date().toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function fmtDayShort(unixSec) {
    const d = new Date(unixSec * 1000);
    return d.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric", month: "short" });
  }

  function fmtTime(unixSec) {
    const d = new Date(unixSec * 1000);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }

  function setBadge(el, countToday) {
    if (!el) return;
    el.classList.remove("badge-green", "badge-orange", "badge-red");

    if (countToday <= 1) {
      el.classList.add("badge-green");
      el.textContent = "Tranquille ✅";
    } else if (countToday <= 3) {
      el.classList.add("badge-orange");
      el.textContent = "Occupé";
    } else {
      el.classList.add("badge-red");
      el.textContent = "Chargé";
    }
  }

  window.initCalendar = function initCalendar() {
    const cfg = window.DASH_CONFIG?.calendar || {};

    // ✅ Tes endpoints réels
    const API_TODAY = cfg.apiToday || "https://calendar.doriansauzede.workers.dev/api/today";
    const API_UPCOMING = cfg.apiUpcoming || "https://calendar.doriansauzede.workers.dev/api/upcoming?days=7";
    const REFRESH_MS = cfg.refreshMs ?? (5 * 60 * 1000);

    // IDs attendus dans calendar.html
    const elTodayDate = document.getElementById("calTodayDate");
    const elBadge = document.getElementById("calTodayBadge");
    const elTodayEvents = document.getElementById("calTodayEvents");
    const elNext = document.getElementById("calNextEvents");

    // Si le HTML n’est pas injecté, on ne fait rien
    if (!elTodayEvents || !elNext) {
      console.warn("[calendar] éléments DOM manquants (include pas prêt?)");
      return;
    }

    async function refresh() {
      try {
        // --- TODAY ---
        const r1 = await fetch(API_TODAY, { cache: "no-store" });
        const today = await r1.json();
        if (!today.ok) throw new Error("today not ok");

        if (elTodayDate) elTodayDate.textContent = fmtTodayDate();
        setBadge(elBadge, today.count ?? (today.events?.length ?? 0));

        const tEvents = Array.isArray(today.events) ? today.events : [];
        if (tEvents.length === 0) {
          elTodayEvents.innerHTML = `<div class="small">Aucun événement aujourd’hui ✅</div>`;
        } else {
          elTodayEvents.innerHTML = tEvents
            .sort((a, b) => (a.startUnix ?? 0) - (b.startUnix ?? 0))
            .map(ev => {
              const time = ev.allDay ? "Toute la journée" : fmtTime(ev.startUnix);
              const loc = ev.location ? `<div class="small">${esc(ev.location)}</div>` : "";
              return `
                <div class="todayEvent">
                  <div class="eventTime">${esc(time)}</div>
                  <div>
                    <div class="eventTitle">${esc(ev.title || "Sans titre")}</div>
                    ${loc}
                  </div>
                </div>
              `;
            })
            .join("");
        }

        // --- UPCOMING ---
        const r2 = await fetch(API_UPCOMING, { cache: "no-store" });
        const up = await r2.json();
        if (!up.ok) throw new Error("upcoming not ok");

        const uEvents = Array.isArray(up.events) ? up.events : [];
        if (uEvents.length === 0) {
          elNext.innerHTML = `<div class="small">Rien de prévu sur les prochains jours.</div>`;
        } else {
          elNext.innerHTML = uEvents
            .sort((a, b) => (a.startUnix ?? 0) - (b.startUnix ?? 0))
            .slice(0, 12) // limite (sinon ça devient énorme)
            .map(ev => {
              const day = fmtDayShort(ev.startUnix);
              const time = ev.allDay ? "Journée" : fmtTime(ev.startUnix);
              return `
                <div class="nextItem">
                  <div class="nextDay">${esc(day)}</div>
                  <div class="nextMain">
                    <div class="nextTime">${esc(time)}</div>
                    <div class="nextTitle">${esc(ev.title || "Sans titre")}</div>
                  </div>
                </div>
              `;
            })
            .join("");
        }

      } catch (e) {
        console.error("[calendar] refresh error:", e);
        elTodayEvents.innerHTML = `<div class="small">Calendrier indisponible</div>`;
        elNext.innerHTML = `<div class="small">—</div>`;
        if (elBadge) {
          elBadge.classList.remove("badge-green", "badge-orange", "badge-red");
          elBadge.textContent = "Erreur";
        }
      }
    }

    // éviter double interval si init appelé 2 fois
    if (window.__CAL_TIMER__) clearInterval(window.__CAL_TIMER__);

    refresh();
    window.__CAL_TIMER__ = setInterval(refresh, REFRESH_MS);

    console.log("[calendar] started");
  };
})();
