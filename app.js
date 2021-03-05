// Initialize
const WebSocket = require('ws')
const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const Weather = require('./weatherData')

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

var FRDM = null

var data = {
  state: 'Normal Operation',
  powerOn: true,
  windSpeed: 20,
  survivalSpeed: 60,
  activeTracking: true,
  weatherData: {
    imgUrl: 'imgUrl',
    temp: '20.0' + "\u00B0C",
    sunrise: 'date',
    sunset: 'date',
    snowDay: 'day'
  }
}

///////////////////////////////////////////////////////////////////////////////
// Directories
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('page2', data)
})

app.get('/login', (req, res) => {
  res.render('page1')
})

///////////////////////////////////////////////////////////////////////////////
// Websocket functions
wss.on('connection', function connection(ws, req) {

  console.log('Client Connected.')

  ws.on('close', () => console.log('Client Disconnected.'))

  ws.on('message', function incoming(message) {

    var json = JSON.parse(message)

    json.hasOwnProperty('state') && (data.powerOn = json.powerOn)
    json.hasOwnProperty('powerOn') && (data.powerOn = json.powerOn)
    json.hasOwnProperty('windSpeed') && (data.windSpeed = json.windSpeed)
    json.hasOwnProperty('survivalSpeed') && (data.survivalSpeed = json.survivalSpeed)
    json.hasOwnProperty('activeTracking') && (data.activeTracking = json.activeTracking)

    if (json.hasOwnProperty('topic')) {
      switch (json.topic) {
        case "FRDM":
          FRDM = ws
          console.log("FRDM-K64F connected.")
          break

        case "onOffClicked":
          data.powerOn = !data.powerOn;
          if (FRDM) {
            FRDM.send('{"topic":"ON/OFF"}');
          };
          broadcast(JSON.stringify({ powerOn: data.powerOn }))
          console.log('Power:', data.powerOn ? 'On' : 'Off')
          break

        case 'survivalSpeed':
          if (json.value == 'increase' & data.survivalSpeed < 80) {
            data.survivalSpeed++
          } else if (json.value == 'decrease' & data.survivalSpeed > 10) {
            data.survivalSpeed--
          }
          broadcast(JSON.stringify({ survivalSpeed: data.survivalSpeed }))
          break

        case 'trackingMode':
          data.activeTracking = !data.activeTracking
          broadcast(JSON.stringify({ activeTracking: data.activeTracking }))
          console.log('Tracking Mode:', data.activeTracking ? 'Active' : 'Auto')
          break
        
        case 'update':
          broadcastAll(JSON.stringify(data))
      };
    }
  });
});

//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients
function broadcastAll(message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  });
}


//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients (Except FRDM)
function broadcast(message) {
  wss.clients.forEach(function each(client) {
    if (client !== FRDM && client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  });
}

//////////////////////////////////////////////////////////////////////////////
// Ping WebSocket connections to keep alive
setInterval(() => {
  wss.clients.forEach(function each(client) {
    client.ping()
  });
}, 5000)

//////////////////////////////////////////////////////////////////////////////
// WeatherData function
async function updateWeather() {
  data.weatherData = await Weather.getWeather();

  // send weatherReport
  broadcast(JSON.stringify({ weatherData: data.weatherData }))
}
updateWeather()
setInterval(() => { updateWeather() }, 60000)

///////////////////////////////////////////////////////////////////////////////
// Console
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
})
