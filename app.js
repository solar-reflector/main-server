// Initialize
const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const weatherData2 = require('./weatherData2');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

var windSpeed = 0;
var survivalSpeed = 65;
var FRDM = null;
var weatherData;

///////////////////////////////////////////////////////////////////////////////
// Directories
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  weatherData.survivalSpeed = survivalSpeed;
  weatherData.windSpeed = '20 km/h'
  res.render('page2', weatherData);
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/page1.html'));
})

///////////////////////////////////////////////////////////////////////////////
// Websocket functions
wss.on('connection', function connection(ws, req) {
  console.log('Client logged in...');

  // Called on connection
  weatherOutput();
  ws.on('close', () => console.log('Client logged out...'));

  ws.on('message', function incoming(data) {

    var json = JSON.parse(data);

    switch (json.topic) {
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
        if (FRDM) {
          FRDM.send('{"topic":"ON/OFF"}');
        };
        break;

      case 'survivalSpeed':
        if (json.value == 'increase' & survivalSpeed < 75) {
          survivalSpeed++
        } else if (json.value == 'decrease' & survivalSpeed > 10) {
          survivalSpeed--
        }
        wss.clients.forEach(function each(client) {
          if (client != FRDM) {
            client.send(JSON.stringify({ survivalSpeed: survivalSpeed }));
          }
        });
        break;
    };
  });
});

//////////////////////////////////////////////////////////////////////////////
// WeatherData function
async function weatherOutput() {
  weatherData = await weatherData2.getWeather2();

  // send weatherReport
  wss.clients.forEach(function each(client) {
    if (client != FRDM) {
      client.send(JSON.stringify({ weatherData: weatherData }));
    }
  });
}
weatherOutput()
setInterval(() => { weatherOutput() }, 60000)


///////////////////////////////////////////////////////////////////////////////
// Console
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
})
