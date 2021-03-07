///////////////////////////////////////////////////////////////////////////////
// Import Libraries
const WebSocket = require('ws')
const express = require('express')
const path = require('path')
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
// Handle WebSocket connections & messages
wss.on('connection', function connection(ws, req) {

  console.log('Client Connected.')

  ws.on('close', () => console.log('Client Disconnected.'))

  ws.on('message', function incoming(message) {

    var json = JSON.parse(message)

    if (json.hasOwnProperty('topic')) {
      switch (json.topic) {
        case "FRDM":
          FRDM = ws

          if (json.hasOwnProperty('data')) {
            for (key in doc.data) {
              data[key] = doc.data[key]
            }
          }
          console.log("FRDM-K64F connected.")
          break

        case "onOffClicked":
          data.powerOn = !data.powerOn
          if (FRDM) {
            FRDM.send('{"topic":"ON/OFF"}')
          }
          broadcast(JSON.stringify({ powerOn: data.powerOn }))
          updateDB({ powerOn: data.powerOn })
          break

        case 'survivalSpeed':
          if (json.value == 'increase' & data.survivalSpeed < 80) {
            data.survivalSpeed++
          } else if (json.value == 'decrease' & data.survivalSpeed > 10) {
            data.survivalSpeed--
          }
          broadcast(JSON.stringify({ survivalSpeed: data.survivalSpeed }))
          updateDB({ survivalSpeed: data.survivalSpeed })
          break

        case 'trackingMode':
          data.activeTracking = !data.activeTracking
          broadcast(JSON.stringify({ activeTracking: data.activeTracking }))
          updateDB({ activeTracking: data.activeTracking })
          break

        case 'update':
          ws.send(JSON.stringify(data))
          break
      }
    }
    // json.hasOwnProperty('state') && (data.powerOn = json.powerOn)
    // json.hasOwnProperty('powerOn') && (data.powerOn = json.powerOn)
    // json.hasOwnProperty('windSpeed') && (data.windSpeed = json.windSpeed)
    // json.hasOwnProperty('survivalSpeed') && (data.survivalSpeed = json.survivalSpeed)
    // json.hasOwnProperty('activeTracking') && (data.activeTracking = json.activeTracking)
  })
})

//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients
function broadcastAll(message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

//////////////////////////////////////////////////////////////////////////////
// Broadcast WebSocket message to all clients (Except FRDM)
function broadcast(message) {
  wss.clients.forEach(function each(client) {
    if (client !== FRDM && client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

//////////////////////////////////////////////////////////////////////////////
// Ping WebSocket connections to keep alive
setInterval(() => {
  wss.clients.forEach(function each(client) {
    client.ping()
  })
}, 5000)

//////////////////////////////////////////////////////////////////////////////
// WeatherData function
async function updateWeather() {
  data.weatherData = await Weather.getWeather()
  broadcast(JSON.stringify({ weatherData: data.weatherData }))
}
updateWeather()
setInterval(() => { updateWeather() }, 60000)

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


//////////////////////////////////////////////////////////////////////////////
// Database Test
async function addDataPoint() {
  await admin.firestore().collection('data').add({
    value: (Math.random() * 200 + 100).toFixed(1),
    mode: 'normal',
    date: admin.firestore.FieldValue.serverTimestamp()
  }).catch(err => { console.log(err) })
}
setInterval(() => { addDataPoint() }, 15000)

///////////////////////////////////////////////////////////////////////////////
// Start server
const port = process.env.PORT || 8080
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
