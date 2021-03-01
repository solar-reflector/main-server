var firebaseConfig = {
    apiKey: "AIzaSyBoxx31JxnOUq5Yes5vGaCNfiYjMjHHVFs",
    authDomain: "solar-reflector-6320d.firebaseapp.com",
    projectId: "solar-reflector-6320d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in');
    } else {
        console.log('user logged out');
        window.location.href = "/login"
    }
});

var ws

var logout = document.querySelector('#logout')
logout.addEventListener('click', (event) => {
    auth.signOut();
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
    console.log('Tracking mode clicked')
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
        setTimeout(() => { startWebsocket() }, 60000);
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

        if (json.hasOwnProperty('state')) {
            power.innerHTML = json.state ? 'Turn Off' : 'Turn On'
        }
    }
}
startWebsocket()