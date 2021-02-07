const express = require('express');
const path = require('path');
const app = express();

//SIO
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var windSpeed = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/page2.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/page1.html'));
})

//SIO
io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('clicked', function(data) {
	     windSpeed++;
	     //send a message to all connected clients
	     io.emit('windUpdate', windSpeed);
     });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
