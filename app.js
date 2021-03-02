// Initialize
const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const Weather = require('./weatherData');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

var FRDM = null;
var weatherData;
var survivalSpeed = 65;
var powerOn = true;
var activeTracking = true;

///////////////////////////////////////////////////////////////////////////////
// Directories
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  weatherData.windSpeed = '20 km/h'
  weatherData.state = 'Normal Operation'
  weatherData.survivalSpeed = survivalSpeed
  weatherData.tracking = activeTracking ? 'Active' : 'Auto'
  weatherData.powerOn = powerOn ? 'Turn Off' : 'Turn On'
  res.render('page2', weatherData)
})

app.get('/login', (req, res) => {
  // res.sendFile(path.join(__dirname + '/public/page1.html'));
  res.render('page1')
})

///////////////////////////////////////////////////////////////////////////////
// Websocket functions
wss.on('connection', function connection(ws, req) {

  // Called on connection
  weatherOutput();
  console.log('Client Connected.');

  ws.on('close', () => console.log('Client Disconnected.'));

  ws.on('message', function incoming(data) {

    var json = JSON.parse(data);

    switch (json.topic) {
      case "FRDM":
        FRDM = ws;
        console.log("FRDM-K64F connected.")
        break;

      case "onOffClicked":
        powerOn = !powerOn;
        if (FRDM) {
          FRDM.send(JSON.stringify({ powerOn: powerOn }));
        };
        broadcast(JSON.stringify({ powerOn: powerOn }))
        console.log('Power:', powerOn ? 'On' : 'Off')
        break;

      case 'survivalSpeed':
        if (json.value == 'increase' & survivalSpeed < 80) {
          survivalSpeed++
        } else if (json.value == 'decrease' & survivalSpeed > 10) {
          survivalSpeed--
        }
        broadcast(JSON.stringify({ survivalSpeed: survivalSpeed }))
        if (FRDM) {
          FRDM.send(JSON.stringify({ survivalSpeed: survivalSpeed }))
        }
        break;

      case 'trackingMode':
        activeTracking = !activeTracking
        broadcast(JSON.stringify({ activeTracking: activeTracking }))
        console.log('Tracking Mode:', activeTracking ? 'Active' : 'Auto')
        break;
    };
  });
});

//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients (Except FRDM)
function broadcast(message) {
  wss.clients.forEach(function each(client) {
    if (client != FRDM) {
      client.send(message);
    }
  });
}

//////////////////////////////////////////////////////////////////////////////
// WeatherData function
async function weatherOutput() {
  weatherData = await Weather.getWeather();

  // send weatherReport
  broadcast(JSON.stringify({ weatherData: weatherData }))
}
weatherOutput()
setInterval(() => { weatherOutput() }, 60000)

//////////////////////////////////////////////////////////////////////////////
// Ping WebSocket connections to keep alive
setInterval(() => {
  wss.clients.forEach(function each(client) {
    client.ping();
  });
}, 5000);

///////////////////////////////////////////////////////////////////////////////
// Console
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
})
