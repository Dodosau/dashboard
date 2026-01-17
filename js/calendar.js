// js/calendar.js
// Affiche: Date du jour + événements du jour + prochains événements

(() => {
  const CAL_WORKER_BASE = "https://calendar.doriansauzede.workers.dev";
  const REFRESH_MS = 60_000; // 1 minute
  const UPCOMING_DAYS = 7;
  const UPCOMING_MAX = 8;

  const todayLabelEl = document.getElementById("calTodayLabel");
  const todayListEl = document.getElementById("calTodayList");
  const todayEmptyEl = document.getElementById("calTodayEmpty");
  const upcomingListEl = document.getElementById("calUpcomingList");

  if (!todayLabelEl || !todayListEl || !todayEmptyEl || !upcomingListEl) return;

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function fmtTodayHeader() {
    const d = new Date();
    return d.toLocaleDateString("fr-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function fmtHHMM(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtUpcomingDate(unix) {
    const d = new Date(unix * 1000);
    // "lun 20 jan"
    return d.toLocaleDateString("fr-CA", { weekday: "short", month: "short", day: "numeric" });
  }

  function sameLocalDay(aUnix, bUnix) {
    const a = new Date(aUnix * 1000);
    const b = new Date(bUnix * 1000);
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function renderToday(events) {
    todayListEl.innerHTML = "";

    if (!events || events.length === 0) {
      todayEmptyEl.style.display = "block";
      return;
    }

    todayEmptyEl.style.display = "none";

    for (const ev of events) {
      const div = document.createElement("div");
      div.className = "calTodayItem";

      let timeText = ev.allDay ? "Toute la journée" : fmtHHMM(ev.startUnix);
      if (!ev.allDay && ev.endUnix) timeText += ` – ${fmtHHMM(ev.endUnix)}`;

      div.innerHTML = `
        <div class="calTodayTime">${escapeHtml(timeText)}</div>
        <div class="calTodayTitle">${escapeHtml(ev.title || "—")}</div>
      `;

      todayListEl.appendChild(div);
    }
  }

  function renderUpcoming(events) {
    upcomingListEl.innerHTML = "";

    if (!events || events.length === 0) {
      // pas besoin d’un message, tu as déjà le bloc "Aujourd’hui"
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const filtered = events
      // garde seulement les events encore pertinents
      .filter(ev => (ev.endUnix ?? ev.startUnix) >= now)
      // retire ceux déjà dans "Aujourd’hui" (même jour)
      .filter(ev => !sameLocalDay(ev.startUnix, now))
      .slice(0, UPCOMING_MAX);

    for (const ev of filtered) {
      const div = document.createElement("div");
      div.className = "calUpItem";

      const dateLeft = fmtUpcomingDate(ev.startUnix);
      const timeText = ev.allDay ? "Toute la journée" : fmtHHMM(ev.startUnix);

      div.innerHTML = `
        <div class="calUpDate">${escapeHtml(dateLeft)}</div>
        <div class="calUpMain">
          <div class="calUpTime">${escapeHtml(timeText)}</div>
          <div class="calUpTitle">${escapeHtml(ev.title || "—")}</div>
        </div>
      `;

      upcomingListEl.appendChild(div);
    }
  }

  async function refresh() {
    try {
      todayLabelEl.textContent = fmtTodayHeader();

      // 1) Aujourd'hui
      const todayRes = await fetch(`${CAL_WORKER_BASE}/api/calendar-today`, { cache: "no-store" });
      const todayData = todayRes.ok ? await todayRes.json() : null;

      const todayEvents = (todayData && todayData.ok) ? (todayData.events || []) : [];

      // 2) Prochains (7 jours)
      const upRes = await fetch(`${CAL_WORKER_BASE}/api/calendar-upcoming?days=${encodeURIComponent(UPCOMING_DAYS)}`, { cache: "no-store" });
      const upData = upRes.ok ? await upRes.json() : null;

      const upEvents = (upData && upData.ok) ? (upData.events || []) : [];

      renderToday(todayEvents);
      renderUpcoming(upEvents);
    } catch (e) {
      // fallback simple
      todayLabelEl.textContent = fmtTodayHeader();
      todayListEl.innerHTML = "";
      todayEmptyEl.style.display = "block";
      todayEmptyEl.textContent = "Calendrier indisponible (réseau)";
      upcomingListEl.innerHTML = "";
    }
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
