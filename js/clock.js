function updateClock() {
  var n = new Date();
  clock.textContent = n.toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit"});
  date.textContent = n.toLocaleDateString("fr-CA",{weekday:"long",day:"numeric",month:"long"});
}
updateClock();
setInterval(updateClock,1000);
