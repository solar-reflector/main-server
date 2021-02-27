// Weather request
var options = {
  host: 'api.openweathermap.org',
  path: '/data/2.5/onecall?lat=45.964993&lon=-66.646332&exclude=minutely,hourly,alerts&units=metric&appid=b8ae12dff762333b98e1972f5ca1fc82'
};

callback = function(response) {
  var weatherData = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    weatherData += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    console.log(weatherData);
  });
}

http.request(options, callback).end(); // End of weather request
