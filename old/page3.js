var survivalSpeedText = document.querySelector('#survivalSpeed')
var increase = document.querySelector('#increase')
var decrease = document.querySelector('#decrease')
var tracking = document.querySelector('#tracking')
var logout = document.querySelector('#logout')
var power = document.querySelector('#power')
var state = document.querySelector('#state')

var firebaseConfig = {
    apiKey: "AIzaSyBoxx31JxnOUq5Yes5vGaCNfiYjMjHHVFs",
    authDomain: "solar-reflector-6320d.firebaseapp.com",
    projectId: "solar-reflector-6320d"
};
var ws
var survivalSpeed = 65

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

logout.addEventListener('click', (event) => {
    auth.signOut();
});

function updateSurvivalSpeed() {
    survivalSpeedText.innerHTML = `Survival Speed: ${survivalSpeed} km/h`
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: survivalSpeed }))
}

increase.addEventListener('click', event => {
    survivalSpeed++
    updateSurvivalSpeed()
})

decrease.addEventListener('click', event => {
    survivalSpeed--
    updateSurvivalSpeed()
})

tracking.addEventListener('click', event => {
    console.log('Tracking mode clicked')
})

logout.addEventListener('click', event => {
    console.log('Logout clicked')
})

power.addEventListener('click', event => {
    console.log('Power clicked')
})

function startWebsocket() {
    ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
    ws.onopen = () => {
        console.log("Websocket started");
    }

    ws.onclose = () => {
        console.log("Websocket closed");
        // setTimeout(startWebsocket(), 10000);
    }

    ws.onmessage = (event) => {
        var json = JSON.parse(event.data);
        switch (json.topic) {
            case 'weatherData':
                document.getElementById("temp").innerHTML = json.temp;
                document.getElementById("snowfall").innerHTML = 'Next Snowfall: ' + json.snowDay;
                document.getElementById("sunrise").innerHTML = 'Sunrise: ' + json.sunrise;
                document.getElementById("sunset").innerHTML = 'Sunset: ' + json.sunset;
                document.getElementById("icon").src = json.imgUrl;
                survivalSpeed = json.survivalSpeed
                break;
            case 'survivalSpeed':
                survivalSpeed = json.value;
                survivalSpeedText.innerHTML = `Survival Speed: ${survivalSpeed} km/h`
                break;
        }
    }
}
startWebsocket()