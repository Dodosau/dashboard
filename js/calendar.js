(() => {
  const BASE = "https://calendar.doriansauzede.workers.dev";
  const TODAY_URL = `${BASE}/api/today`;
  const UPCOMING_URL = `${BASE}/api/upcoming?days=7`;

  const REFRESH_TODAY_MS = 60000;      // 60s
  const REFRESH_UPCOMING_MS = 300000;  // 5 min

  const elDate = document.getElementById("calendarDate");
  const elToday = document.getElementById("calendarToday");
  const elUpcoming = document.getElementById("calendarUpcoming");

  function fmtTime(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDay(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleDateString("fr-CA", { weekday: "short", day: "2-digit", month: "2-digit" });
  }

  function renderToday(events) {
    if (!elToday) return;

    if (!events || events.length === 0) {
      elToday.innerHTML = `<div class="small muted">Aucun événement aujourd’hui</div>`;
      return;
    }

    elToday.innerHTML = events.map(ev => {
      const when = ev.allDay ? "Toute la journée" : `${fmtTime(ev.startUnix)} – ${fmtTime(ev.endUnix ?? ev.startUnix)}`;
      const loc = ev.location ? `<div class="small muted">${escapeHtml(ev.location)}</div>` : "";
      return `
        <div class="calItem">
          <div class="calMain">
            <div class="calTitle">${escapeHtml(ev.title)}</div>
            <div class="calWhen">${when}</div>
            ${loc}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderUpcoming(events) {
    if (!elUpcoming) return;

    if (!events || events.length === 0) {
      elUpcoming.innerHTML = `<div class="small muted">Rien à venir</div>`;
      return;
    }

    // format demandé : date à gauche, horaire + titre à droite, plus petit
    elUpcoming.innerHTML = events.map(ev => {
      const day = fmtDay(ev.startUnix);
      const time = ev.allDay ? "" : fmtTime(ev.startUnix);
      return `
        <div class="calRowSmall">
          <div class="calLeft">${day}</div>
          <div class="calRight">
            <div class="calLine">${time ? `<span class="calTime">${time}</span>` : ""} ${escapeHtml(ev.title)}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function refreshToday() {
    try {
      const res = await fetch(TODAY_URL, { cache: "no-store" });
      const data = await res.json();

      if (!data.ok) throw new Error("API not ok");

      if (elDate) {
        // data.date est déjà YYYY-MM-DD
        const d = new Date();
        elDate.textContent = d.toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      }

      renderToday(data.events || []);
    } catch (e) {
      if (elToday) elToday.innerHTML = `<div class="small muted">Calendrier indisponible</div>`;
    }
  }

  async function refreshUpcoming() {
    try {
      const res = await fetch(UPCOMING_URL, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error("API not ok");
      renderUpcoming(data.events || []);
    } catch (e) {
      if (elUpcoming) elUpcoming.innerHTML = `<div class="small muted">—</div>`;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  refreshToday();
  refreshUpcoming();
  setInterval(refreshToday, REFRESH_TODAY_MS);
  setInterval(refreshUpcoming, REFRESH_UPCOMING_MS);
})();
