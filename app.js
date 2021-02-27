const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
var windSpeed = 0;
var FRDM = null;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/page3.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/page1.html'));
})

wss.on('connection', function connection(ws, req) {
    console.log('Client logged in...');

    ws.on('close', () => console.log('Client logged out...'));

    ws.on('message', function incoming(data) {

      var json = JSON.parse(data);

      switch(json.topic){
        case "FRDM":
          FRDM = ws;
          console.log("FRDM-K64F connected...")
          break;

        case "settingsClicked":
          windSpeed++;
          wss.clients.forEach(function each(client) {
            client.send('{"topic":"windUpdate", "windSpeed":' + windSpeed + '}');
          });
          break;

        case "onOffClicked":
          if(FRDM){
            FRDM.send('{"topic":"ON/OFF"}');
          };
          break;
        };
    });
});

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


const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
})
