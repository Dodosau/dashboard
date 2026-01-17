function updateWedding() {
  var t=new Date(), w=new Date("2026-06-17");
  t.setHours(0,0,0,0); w.setHours(0,0,0,0);
  var d=Math.ceil((w-t)/(86400000));
  weddingDays.textContent=d>0?d:(d===0?"C’est aujourd’hui 🎉":"Déjà mariés ❤️");
}
updateWedding();
setInterval(updateWedding,3600000);
