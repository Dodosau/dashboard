(() => {
  const API = "https://calendar.doriansauzede.workers.dev/api/today";

  const elDate = document.getElementById("calendarDate");
  const elList = document.getElementById("calendarToday");
  const elBadge = document.getElementById("calendarBadge");

  function fmtDate(d) {
    return d.toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  function fmtTime(unix) {
    return new Date(unix * 1000).toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function setBadge(count) {
    elBadge.className = "todayBadge";

    if (count === 0) {
      elBadge.textContent = "Journée libre";
      elBadge.classList.add("badge-green");
    } else if (count <= 2) {
      elBadge.textContent = "Journée légère";
      elBadge.classList.add("badge-green");
    } else if (count <= 4) {
      elBadge.textContent = "Journée chargée";
      elBadge.classList.add("badge-orange");
    } else {
      elBadge.textContent = "Journée très chargée";
      elBadge.classList.add("badge-red");
    }
  }

  async function loadToday() {
    try {
      const res = await fetch(API, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error();

      const events = data.events || [];

      elDate.textContent = fmtDate(new Date());
      setBadge(events.length);

      if (events.length === 0) {
        elList.innerHTML = `<div class="small muted">Aucun événement aujourd’hui ✨</div>`;
        return;
      }

      elList.innerHTML = events.map(ev => `
        <div class="todayEvent">
          <div class="eventTime">
            ${ev.allDay ? "—" : fmtTime(ev.startUnix)}
          </div>
          <div class="eventTitle">${ev.title}</div>
        </div>
      `).join("");

    } catch {
      elList.innerHTML = `<div class="small muted">Calendrier indisponible</div>`;
      elBadge.textContent = "—";
    }
  }

  loadToday();
  setInterval(loadToday, 60_000);
})();
