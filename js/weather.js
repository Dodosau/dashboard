function icon(code){
  if(code===0)return"☀️";
  if(code<=2)return"⛅";
  if(code<=3)return"☁️";
  if(code>=61&&code<=82)return"🌧️";
  if(code>=71&&code<=86)return"❄️";
  if(code>=95)return"⛈️";
  return"🌡️";
}
function text(code){
  if(code===0)return"Ensoleillé";
  if(code<=2)return"Partiellement nuageux";
  if(code<=3)return"Couvert";
  if(code>=61&&code<=82)return"Pluie";
  if(code>=71&&code<=86)return"Neige";
  if(code>=95)return"Orage";
  return"Variable";
}
function weather(){
  fetch("https://api.open-meteo.com/v1/forecast?latitude=45.5019&longitude=-73.5674&current=temperature_2m,weather_code&hourly=precipitation_probability&daily=temperature_2m_min,temperature_2m_max&timezone=America%2FMontreal")
  .then(r=>r.json()).then(d=>{
    tempNow.textContent=Math.round(d.current.temperature_2m)+"°C";
    weatherIcon.textContent=icon(d.current.weather_code);
    weatherText.textContent=text(d.current.weather_code);
    tempRange.textContent=
      Math.round(d.daily.temperature_2m_min[0])+"° / "+
      Math.round(d.daily.temperature_2m_max[0])+"°";
    precipProb.textContent=Math.round(d.hourly.precipitation_probability[0])+"%";
  });
}
weather();
setInterval(weather,600000);
