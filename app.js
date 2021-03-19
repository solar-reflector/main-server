///////////////////////////////////////////////////////////////////////////////
// Import Libraries
const WebSocket = require('ws')
const express = require('express')
const app = express()
const http = require('http')
const Weather = require('./weatherData')
const admin = require("firebase-admin")
const serviceAccount = require("./accountKey")

///////////////////////////////////////////////////////////////////////////////
// Initialize 
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

var FRDM = null
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
const states = ['Initialization', 'Normal Operation', 'Wind Survival', 'Manual Mode', 'Manual Mode', 'Wind Settings']
var inverterPower = 0;

///////////////////////////////////////////////////////////////////////////////
// Directories
app.use(express.static(__dirname + '\\public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('page2', data)
})

app.get('/login', (req, res) => {
  res.render('page1')
})

app.get('/pc', (req, res) => {
  res.render('page2_pc', data)
})

app.get('/inverter', (req, res) => {
  res.sendFile(__dirname + '/public/slider.html')
})

app.get('/solar_api/v1/GetInverterRealtimeData.cgi', (req, res) => {
  console.log('Inverter data accessed')
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
      data.state = states[json.state]
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
          } else if (json.value == 'decrease' & data.survivalSpeed > 30) {
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
async function updateWeather() {
  data.weatherData = await Weather.getWeather()
  broadcast({ weatherData: data.weatherData })
}
updateWeather()
setInterval(() => { updateWeather() }, 300000)

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
