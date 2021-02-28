const http = require('http');

function getWeather() {
var result = "a";

  var options = {
    host: 'api.openweathermap.org',
    path: '/data/2.5/onecall?lat=45.964993&lon=-66.646332&exclude=minutely,hourly,alerts&units=metric&appid=b8ae12dff762333b98e1972f5ca1fc82'
  };

  callback = function(response) {
    var weatherData = '';

    response.on('data', function (chunk) {
      weatherData += chunk;
    });

    response.on('end', function () {
      var json = JSON.parse(weatherData);
      var weatherJson;
      var imgUrl;
      var temp;
      var sunrise;
      var sunset;
      var hours;
      var minutes;
      var snowDay = "None";
      var flag = true;

      // Get picture
      imgUrl = "openweathermap.org/img/wn/" + json.current.weather.icon + "@2x.png";

      // Get temp
      temp = (json.current.temp).toFixed(1) + "\u00B0C";
      //console.log("Temperature: " + temp);

      // Get sunrise/sunset
      sunrise = new Date(json.current.sunrise * 1000);
      hours = sunrise.getHours();
      minutes = "0" + sunrise.getMinutes();
      sunrise = hours + ":" + minutes.substr(-2) + " AM";
      sunset = new Date(json.current.sunset * 1000);
      hours = sunset.getHours() - 12;
      minutes = "0" + sunset.getMinutes();
      sunset = hours + ":" + minutes.substr(-2) + " PM";
      //console.log("Sunrise: " + sunrise);
      //console.log("Sunset: " + sunset);

      // Get next snow day
      json.daily.forEach(day => {
        if(day.weather[0].main == "Snow" && flag) {
          snowDay = new Date(day.dt*1000)
          snowDay = snowDay.toLocaleString("en-US",{weekday:"long"})
          //console.log("Next snow day: " + snowDay);
          flag = false;
        }
      })

      result = {imgUrl:imgUrl, temp:temp, sunrise:sunrise, sunset:sunset, snowDay:snowDay};
      //console.log(result);

    })
  }

  http.request(options, callback).end(); // End of weather request

  while(result == "a"){}
  return result;

}

module.exports = {getWeather};
