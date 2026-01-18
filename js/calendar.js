(() => {
  const BASE = "https://calendar.doriansauzede.workers.dev";
  const TODAY_URL = `${BASE}/api/today`;
  const UPCOMING_URL = `${BASE}/api/upcoming?days=7`;

  const REFRESH_TODAY_MS = 60000;      // 60s (suffisant)
  const REFRESH_UPCOMING_MS = 300000;  // 5 min

  const elChip = document.getElementById("calendarDateChip");
  const elToday = document.getElementById("calendarToday");
  const elTomorrow = document.getElementById("calendarTomorrow");
  const elUpcoming = document.getElementById("calendarUpcoming");
  const elTodayMeta = document.getElementById("calendarTodayMeta");
  const elTomorrowMeta = document.getElementById("calendarTomorrowMeta");

  function fmtTime(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDateLong(d) {
    return d.toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function ymd(d) {
    const p = d.toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
    // fr-CA = YYYY-MM-DD déjà, pratique
    return p;
  }

  function dayLabel(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleDateString("fr-CA", { weekday: "short", day: "2-digit", month: "2-digit" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  function renderEventCard(ev, compact=false) {
    const when = ev.allDay
      ? "Toute la journée"
      : `${fmtTime(ev.startUnix)} – ${fmtTime(ev.endUnix ?? ev.startUnix)}`;

    const loc = ev.location ? `<div class="eventLoc">${escapeHtml(ev.location)}</div>` : "";
    const badge = ev.allDay ? `<div class="eventBadge">All-day</div>` : "";

    return `
      <div class="eventCard">
        <div class="eventTop">
          <div class="eventTitle">${escapeHtml(ev.title)}</div>
          <div class="eventTime">${when}</div>
        </div>
        ${loc}
        ${badge}
      </div>
    `;
  }

  function renderToday(events) {
    if (!elToday) return;
    if (!events || events.length === 0) {
      elToday.innerHTML = `<div class="small muted">Rien de prévu aujourd’hui ✨</div>`;
      if (elTodayMeta) elTodayMeta.textContent = "0 événement";
      return;
    }
    elToday.innerHTML = events.map(ev => renderEventCard(ev)).join("");
    if (elTodayMeta) elTodayMeta.textContent = `${events.length} événement${events.length>1?"s":""}`;
  }

  function renderTomorrow(allUpcoming) {
    if (!elTomorrow) return;

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowKey = ymd(tomorrow);

    const tomorrowEvents = (allUpcoming || []).filter(ev => {
      const d = new Date(ev.startUnix * 1000);
      return ymd(d) === tomorrowKey;
    });

    if (tomorrowEvents.length === 0) {
      elTomorrow.innerHTML = `<div class="small muted">Rien de prévu demain</div>`;
      if (elTomorrowMeta) elTomorrowMeta.textContent = "0 événement";
      return;
    }

    elTomorrow.innerHTML = tomorrowEvents.map(ev => renderEventCard(ev, true)).join("");
    if (elTomorrowMeta) elTomorrowMeta.textContent = `${tomorrowEvents.length} événement${tomorrowEvents.length>1?"s":""}`;
  }

  function renderUpcomingList(events) {
    if (!elUpcoming) return;
    if (!events || events.length === 0) {
      elUpcoming.innerHTML = `<div class="small muted">Rien à venir</div>`;
      return;
    }

    // On enlève aujourd’hui pour éviter doublon (optionnel)
    const todayKey = ymd(new Date());
    const filtered = events.filter(ev => ymd(new Date(ev.startUnix*1000)) !== todayKey);

    elUpcoming.innerHTML = filtered.slice(0, 12).map(ev => {
      const left = dayLabel(ev.startUnix);
      const time = ev.allDay ? "" : fmtTime(ev.startUnix);
      return `
        <div class="calRow">
          <div class="calLeft">${left}</div>
          <div class="calRight">
            ${time ? `<span class="calTime">${time}</span>` : ""}
            ${escapeHtml(ev.title)}
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

      if (elChip) elChip.textContent = fmtDateLong(new Date());
      renderToday(data.events || []);
    } catch {
      if (elToday) elToday.innerHTML = `<div class="small muted">Calendrier indisponible</div>`;
      if (elTodayMeta) elTodayMeta.textContent = "—";
    }
  }

  async function refreshUpcoming() {
    try {
      const res = await fetch(UPCOMING_URL, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error("API not ok");

      const events = data.events || [];
      renderTomorrow(events);
      renderUpcomingList(events);
    } catch {
      if (elTomorrow) elTomorrow.innerHTML = `<div class="small muted">—</div>`;
      if (elUpcoming) elUpcoming.innerHTML = `<div class="small muted">—</div>`;
      if (elTomorrowMeta) elTomorrowMeta.textContent = "—";
    }
  }

  refreshToday();
  refreshUpcoming();
  setInterval(refreshToday, REFRESH_TODAY_MS);
  setInterval(refreshUpcoming, REFRESH_UPCOMING_MS);
})();
