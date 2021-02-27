// Initialize
const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const weatherData = require('./weatherData');
var windSpeed = 0;
var FRDM = null;

///////////////////////////////////////////////////////////////////////////////
// Directories
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/page3.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/page1.html'));
})

///////////////////////////////////////////////////////////////////////////////
// Websocket functions
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

//////////////////////////////////////////////////////////////////////////////
// Call weatherData
console.log(weatherData.getWeather());

///////////////////////////////////////////////////////////////////////////////
// Console
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
})
