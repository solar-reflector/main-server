const axios = require('axios');

async function getWeather2() {

  var result = "Incorrect data";

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/onecall?lat=45.964993&lon=-66.646332&exclude=minutely,hourly,alerts&units=metric&appid=b8ae12dff762333b98e1972f5ca1fc82');
    //const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    //console.log('Date in Response header:', headerDate);
    const json = response.data;

    // Get picture
    var imgUrl = "https://openweathermap.org/img/wn/" + json.current.weather[0].icon + "@2x.png";

    // Get temp
    var temp = (json.current.temp).toFixed(1) + "\u00B0C";

    // Get sunrise/sunset
    var sunrise = new Date(json.current.sunrise * 1000 - 4*60*60*1000);
    var hours = sunrise.getHours();
    var minutes = "0" + sunrise.getMinutes();
    sunrise = hours + ":" + minutes.substr(-2) + " AM";
    var sunset = new Date(json.current.sunset * 1000 - 4*60*60*1000);
    hours = sunset.getHours() - 12;
    minutes = "0" + sunset.getMinutes();
    sunset = hours + ":" + minutes.substr(-2) + " PM";

    // Get next snow day
    var snowDay = "None";
    var flag = true;

    json.daily.forEach(day => {
      if(day.weather[0].main == "Snow" && flag) {
        snowDay = new Date(day.dt*1000)
        snowDay = snowDay.toLocaleString("en-US",{weekday:"long"})
        flag = false;
      }
    })

    result = {imgUrl:imgUrl, temp:temp, sunrise:sunrise, sunset:sunset, snowDay:snowDay};

  } catch (error) {
    console.error(error);
  }

  return(result);

}

module.exports = {getWeather2};
