(() => {
  // Mets ici ton endpoint Worker calendrier (JSON)
  // Exemple : https://calendar.doriansauzede.workers.dev/api/next?days=7
  const API = (window.DASH_CONFIG && window.DASH_CONFIG.CALENDAR_API)
    ? window.DASH_CONFIG.CALENDAR_API
    : "https://calendar.doriansauzede.workers.dev/api/next?days=7";

  const REFRESH_MS = 60_000; // 1 minute (le calendrier n’a pas besoin de 15s)

  const elTodayDate = document.getElementById("calTodayDate");
  const elBadge = document.getElementById("calTodayBadge");
  const elTodayEvents = document.getElementById("calTodayEvents");
  const elNextDays = document.getElementById("calNextDays");

  function fmtDateFr(d) {
    return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
  }

  function fmtShortDayFr(d) {
    return d.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric", month: "short" });
  }

  function fmtTimeFr(d) {
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }

  function isSameLocalDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function setBadge(countToday) {
    if (!elBadge) return;

    elBadge.classList.remove("badge-green", "badge-orange", "badge-red");

    if (countToday <= 2) {
      elBadge.classList.add("badge-green");
      elBadge.textContent = "Journée légère";
    } else if (countToday <= 4) {
      elBadge.classList.add("badge-orange");
      elBadge.textContent = "Journée chargée";
    } else {
      elBadge.classList.add("badge-red");
      elBadge.textContent = "Journée très chargée";
    }
  }

  function renderToday(todayEvents) {
    if (!elTodayEvents) return;

    if (todayEvents.length === 0) {
      elTodayEvents.innerHTML = `<div class="small">Aucun événement aujourd’hui ✅</div>`;
      return;
    }

    elTodayEvents.innerHTML = todayEvents.map(ev => {
      const start = new Date(ev.startUnix * 1000);
      const time = ev.allDay ? "Toute la journée" : fmtTimeFr(start);

      const meta = ev.location ? `<div class="eventMeta">${escapeHtml(ev.location)}</div>` : "";

      return `
        <div class="todayEvent">
          <div class="eventTime">${time}</div>
          <div>
            <div class="eventTitle">${escapeHtml(ev.title || "Sans titre")}</div>
            ${meta}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderNextDays(nextEventsByDay) {
    if (!elNextDays) return;

    const keys = Array.from(nextEventsByDay.keys()).sort(); // YYYY-MM-DD
    if (keys.length === 0) {
      elNextDays.innerHTML = `<div class="small">Rien de prévu sur les prochains jours.</div>`;
      return;
    }

    elNextDays.innerHTML = keys.map(dayKey => {
      const items = nextEventsByDay.get(dayKey);
      const d = new Date(dayKey + "T12:00:00"); // midi local (évite issues TZ)
      const header = fmtShortDayFr(d);

      const rows = items.slice(0, 4).map(ev => {
        const start = new Date(ev.startUnix * 1000);
        const time = ev.allDay ? "Journée" : fmtTimeFr(start);

        return `
          <div class="nextEventRow">
            <div class="nextEventTime">${time}</div>
            <div class="nextEventTitle">${escapeHtml(ev.title || "Sans titre")}</div>
          </div>
        `;
      }).join("");

      const extra = items.length > 4
        ? `<div class="small">+ ${items.length - 4} autre(s)</div>`
        : "";

      return `
        <div class="nextDayBlock">
          <div class="nextDayHeader">
            <div class="nextDayDate">${header}</div>
            <div class="nextDayCount">${items.length} év.</div>
          </div>
          <div class="nextDayEvents">${rows}</div>
          ${extra}
        </div>
      `;
    }).join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[m]));
  }

  async function refresh() {
    try {
      const res = await fetch(API, { cache: "no-store" });
      const data = await res.json();

      if (!data || data.ok !== true || !Array.isArray(data.events)) {
        throw new Error("Bad calendar payload");
      }

      const now = new Date();
      if (elTodayDate) elTodayDate.textContent = fmtDateFr(now);

      // Séparer aujourd’hui vs prochains jours (en LOCAL Montréal, car Date() est local)
      const todayEvents = [];
      const nextByDay = new Map(); // YYYY-MM-DD -> events[]

      for (const ev of data.events) {
        if (!ev || !ev.startUnix) continue;
        const start = new Date(ev.startUnix * 1000);

        if (isSameLocalDay(start, now)) {
          todayEvents.push(ev);
        } else if (start > now) {
          const key = start.toLocaleDateString("en-CA"); // YYYY-MM-DD
          if (!nextByDay.has(key)) nextByDay.set(key, []);
          nextByDay.get(key).push(ev);
        }
      }

      // Tri
      todayEvents.sort((a, b) => a.startUnix - b.startUnix);
      for (const [k, arr] of nextByDay) arr.sort((a, b) => a.startUnix - b.startUnix);

      setBadge(todayEvents.length);
      renderToday(todayEvents);
      renderNextDays(nextByDay);

    } catch (e) {
      if (elTodayEvents) elTodayEvents.innerHTML = `<div class="small">Calendrier indisponible</div>`;
      if (elNextDays) elNextDays.innerHTML = `<div class="small">—</div>`;
      if (elBadge) {
        elBadge.classList.remove("badge-green", "badge-orange", "badge-red");
        elBadge.textContent = "Erreur";
      }
      console.error("Calendar error:", e);
    }
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
