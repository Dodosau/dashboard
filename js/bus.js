function updateBus() {
  fetch("https://stm-bus.doriansauzede.workers.dev")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var el = document.getElementById("busNext");
      if (!el) return;

      if (data && typeof data.nextBusMinutes === "number") {
        el.textContent = "Prochain bus dans " + data.nextBusMinutes + " min";
      } else {
        el.textContent = "Donnée STM invalide";
      }
    })
    .catch(function () {
      var el = document.getElementById("busNext");
      if (el) el.textContent = "STM indisponible";
    });
}

updateBus();
setInterval(updateBus, 30000); // toutes les 30s
