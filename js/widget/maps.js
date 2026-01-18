(function(){
  var o="267 Rue Rachel Est, Montréal, QC";
  var d="6666 Rue Saint-Urbain, Montréal, QC";
  gmTransit.href="https://www.google.com/maps/dir/?api=1&origin="+
    encodeURIComponent(o)+"&destination="+encodeURIComponent(d)+"&travelmode=transit";
  gmBus55.href="https://www.google.com/maps/search/?api=1&query="+
    encodeURIComponent("Bus 55 Montréal "+o+" vers "+d);
})();
