///////////////////////////////////////////////////////////////////////////////
// Import Libraries
const serviceAccount = require("./accountKey")
const Weather = require('./weatherData')
const SunPos = require('./sunPosition')
const admin = require("firebase-admin")
const express = require('express')
const WebSocket = require('ws')
const http = require('http')

///////////////////////////////////////////////////////////////////////////////
// Initialize
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

///////////////////////////////////////////////////////////////////////////////
// Variables
var FRDM = null
var inverterPower = 0;
var data = {
  state: 'Normal Operation',
  powerOn: false,
  windSpeed: 20,
  survivalSpeed: 60,
  activeTracking: true,
  weatherData: {
    imgUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    temp: '20.0' + "\u00B0C",
    sunrise: 'date',
    sunset: 'date',
    snowDay: 'day'
  }
}

const states = {
  1: 'Normal Operation',
  2: 'Wind Survival',
  3: 'Manual Mode',
  4: 'Manual Mode',
  5: 'Wind Settings',
  9: 'Overheat',
  10: 'Overheat Main',
  11: 'Sleep Mode'
}

///////////////////////////////////////////////////////////////////////////////
// Directories
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('page2', data)
})

app.get('/login', (req, res) => {
  res.render('page1')
})

app.get('/graph', (req, res) => {
  res.render('page2_pc', data)
})

app.get('/inverter', (req, res) => {
  res.render('inverter')
})

app.get('/solar_api/v1/GetInverterRealtimeData.cgi', (req, res) => {
  res.send(JSON.stringify({
    Body: {
      Data: {
        DeviceStatus: {
          InverterState: 'Running'
        },
        PAC: {
          Unit: 'W',
          Value: inverterPower
        }
      }
    }
  }))
})

///////////////////////////////////////////////////////////////////////////////
// Handle WebSocket connections & messages
wss.on('connection', function connection(ws, req) {

  console.log('Client Connected.')

  ws.on('close', () => console.log('Client Disconnected.'))

  ws.on('message', function incoming(message) {

    const json = JSON.parse(message)
    console.log('WebSocket message:', json)

    if (json.hasOwnProperty('inverterPower')) {
      inverterPower = json.inverterPower
    }

    if (json.hasOwnProperty('windSpeed')) {
      data.windSpeed = json.windSpeed
      broadcast({ windSpeed: data.windSpeed }, true)
    }

    if (json.hasOwnProperty('survivalSpeed')) {
      data.survivalSpeed = json.survivalSpeed
      broadcast({ survivalSpeed: data.survivalSpeed }, true)
    }

    if (json.hasOwnProperty('state')) {
      data.state = states[json.state] || states[0]
      broadcast({ state: data.state }, true)
    }

    if (json.hasOwnProperty('activeTracking')) {
      data.activeTracking = json.activeTracking
      broadcast({ activeTracking: json.activeTracking }, true)
    }

    if (json.hasOwnProperty('topic')) {
      switch (json.topic) {
        case "FRDM":
          FRDM = ws
          console.log("FRDM-K64F connected.")
          break

        case "power":
          data.powerOn = !data.powerOn
          broadcastAll({ powerOn: data.powerOn }, true)
          break

        case 'survivalSpeed':
          if (json.value == 'increase' & data.survivalSpeed < 70) {
            data.survivalSpeed = data.survivalSpeed + 5
          } else if (json.value == 'decrease' & data.survivalSpeed > 10) {
            data.survivalSpeed = data.survivalSpeed - 5
          }
          data.survivalSpeed = Math.round(data.survivalSpeed / 5) * 5
          broadcastAll({ survivalSpeed: data.survivalSpeed }, true)
          break

        case 'trackingMode':
          data.activeTracking = !data.activeTracking
          broadcastAll({ activeTracking: data.activeTracking }, true)
          break

        case 'update':
          ws.send(JSON.stringify(data))
          break

        case 'getSunPosition':
          SunPos.getPosition().then(angle => {
            FRDM.send(JSON.stringify(angle))
          })
          break
      }
    }
  })
})

//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients
function broadcastAll(message, update = false) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
  if (update) updateDB(message)
}

//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients (Except FRDM)
function broadcast(message, update = false) {
  wss.clients.forEach(function each(client) {
    if (client !== FRDM && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
  if (update) updateDB(message)
}

//////////////////////////////////////////////////////////////////////////////
// Ping WebSocket connections to keep alive
setInterval(() => {
  wss.clients.forEach(function each(client) {
    client.ping()
  })
}, 30000)

//////////////////////////////////////////////////////////////////////////////
// WeatherData function
Weather.getWeather().then(weatherData => data.weatherData = weatherData)
setInterval(() => {
  Weather.getWeather().then(weatherData => {
    data.weatherData = weatherData
    broadcast({ weatherData: weatherData })
  })
}, 300000)

//////////////////////////////////////////////////////////////////////////////
// Database functions (Read/Write)
const deviceRef = admin.firestore().collection('devices').doc('FRDM')

async function updateDB(item) {
  await deviceRef.update(item)
    .catch(() => console.log('Error upating Firestore.'))
}

async function getDB() {
  const doc = await deviceRef.get()
  if (!doc.exists) {
    console.log('Error getting document')
  } else {
    for (key in doc.data()) {
      data[key] = doc.data()[key]
    }
    broadcast(data)
  }
}
getDB()

///////////////////////////////////////////////////////////////////////////////
// Start server
const port = process.env.PORT || 8080
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
