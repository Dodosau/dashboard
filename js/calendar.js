// js/calendar.js
// Widget calendrier basé sur ton Worker calendar: /api/calendar-upcoming?days=7

(() => {
  const CAL_WORKER_BASE = "https://calendar.doriansauzede.workers.dev";
  const DAYS = 7;
  const REFRESH_MS = 60_000; // 1 min

  const badge = document.getElementById("calNext");
  const titleEl = document.getElementById("calTitle");
  const whenEl = document.getElementById("calWhen");
  const listEl = document.getElementById("calList");

  if (!badge || !titleEl || !whenEl || !listEl) return;

  function setBadge(text, cls) {
    badge.textContent = text;
    badge.classList.remove("soon", "today", "later", "na");
    badge.classList.add(cls);
  }

  function fmtHHMM(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDay(unix) {
    const d = new Date(unix * 1000);
    return d.toLocaleDateString("fr-CA", { weekday: "short", month: "short", day: "numeric" });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function isSameLocalDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function renderNext(events) {
    const now = new Date();

    if (!events || events.length === 0) {
      setBadge("—", "na");
      titleEl.textContent = "Rien à venir";
      whenEl.textContent = "";
      return;
    }

    const ev = events[0];
    const start = new Date(ev.startUnix * 1000);
    const mins = Math.round((start.getTime() - now.getTime()) / 60000);

    // Badge text
    if (mins <= 0) setBadge("Maint.", "soon");
    else if (mins < 60) setBadge(`${mins} min`, "soon");
    else {
      const hours = Math.round(mins / 60);
      setBadge(`${hours} h`, isSameLocalDay(start, now) ? "today" : "later");
    }

    titleEl.textContent = ev.title || "—";

    const day = fmtDay(ev.startUnix);
    const hhmm = fmtHHMM(ev.startUnix);
    whenEl.textContent = `${day} • ${hhmm}`;
  }

  function renderList(events) {
    listEl.innerHTML = "";

    if (!events || events.length === 0) return;

    // On affiche les 4 prochains (tu peux changer)
    const slice = events.slice(0, 4);

    for (const ev of slice) {
      const div = document.createElement("div");
      div.className = "calItem";

      const lineTime = `${fmtDay(ev.startUnix)} • ${fmtHHMM(ev.startUnix)}`;
      div.innerHTML = `
        <div class="calTime">${escapeHtml(lineTime)}</div>
        <div class="calLine">${escapeHtml(ev.title || "—")}</div>
      `;
      listEl.appendChild(div);
    }
  }

  async function refresh() {
    try {
      const url = `${CAL_WORKER_BASE}/api/calendar-upcoming?days=${encodeURIComponent(DAYS)}`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        setBadge("—", "na");
        titleEl.textContent = `Calendrier indisponible`;
        whenEl.textContent = `HTTP ${res.status}`;
        listEl.innerHTML = "";
        return;
      }

      const data = await res.json();

      if (!data.ok) {
        setBadge("—", "na");
        titleEl.textContent = "Calendrier indisponible";
        whenEl.textContent = "";
        listEl.innerHTML = "";
        return;
      }

      const events = data.events || [];
      renderNext(events);
      renderList(events);
    } catch (e) {
      setBadge("—", "na");
      titleEl.textContent = "Calendrier indisponible";
      whenEl.textContent = "Réseau";
      listEl.innerHTML = "";
    }
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
