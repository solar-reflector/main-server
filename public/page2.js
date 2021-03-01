var ws
var firebaseConfig = {
    apiKey: "AIzaSyBoxx31JxnOUq5Yes5vGaCNfiYjMjHHVFs",
    authDomain: "solar-reflector-6320d.firebaseapp.com",
    projectId: "solar-reflector-6320d"
};

var logout = document.querySelector('#logout')
logout.addEventListener('click', (event) => {
    firebase.auth().signOut();
});

var increase = document.querySelector('#increase')
increase.addEventListener('click', event => {
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: 'increase' }))
})

var decrease = document.querySelector('#decrease')
decrease.addEventListener('click', event => {
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: 'decrease' }))
})

var tracking = document.querySelector('#tracking')
tracking.addEventListener('click', event => {
    ws.send(JSON.stringify({ topic: 'trackingMode' }))
})

var power = document.querySelector('#power')
power.addEventListener('click', event => {
    ws.send(JSON.stringify({ topic: 'onOffClicked' }))
})

function startWebsocket() {
    ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
    ws.onopen = () => {
        console.log("Websocket started");
    }

    ws.onclose = () => {
        console.log("Websocket closed");
        setTimeout(() => { startWebsocket() }, 15000);
    }

    ws.onmessage = (event) => {
        var json = JSON.parse(event.data);
        console.log(json)

        if (json.hasOwnProperty('weatherData')) {
            let { temp, snowDay, sunrise, sunset, imgUrl } = json.weatherData;
            document.getElementById("temp").innerHTML = temp;
            document.getElementById("snowfall").innerHTML = 'Next Snowfall: ' + snowDay;
            document.getElementById("sunrise").innerHTML = 'Sunrise: ' + sunrise;
            document.getElementById("sunset").innerHTML = 'Sunset: ' + sunset;
            document.getElementById("icon").src = imgUrl;
        }

        if (json.hasOwnProperty('survivalSpeed')) {
            document.getElementById('survivalSpeed').innerHTML = `Survival Speed: ${json.survivalSpeed} km/h`
        }

        if (json.hasOwnProperty('powerOn')) {
            power.innerHTML = json.powerOn ? 'Turn Off' : 'Turn On'
        }

        if (json.hasOwnProperty('activeTracking')) {
            tracking.innerHTML = json.activeTracking ? 'Active' : 'Auto'
        }
    }
}
startWebsocket()

firebase.initializeApp(firebaseConfig);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in');
    } else {
        console.log('user logged out');
        window.location.href = "/login"
    }
});