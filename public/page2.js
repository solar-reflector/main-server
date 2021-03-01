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
    // survivalSpeed++
    // updateSurvivalSpeed()
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: 'increase' }))
})

decrease.addEventListener('click', event => {
    // survivalSpeed--
    // updateSurvivalSpeed()
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: 'decrease' }))
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
        console.log(json)
        if (json.weatherData) {
            let { temp, snowDay, sunrise, sunset, imgUrl } = json.weatherData;
            document.getElementById("temp").innerHTML = temp;
            document.getElementById("snowfall").innerHTML = 'Next Snowfall: ' + snowDay;
            document.getElementById("sunrise").innerHTML = 'Sunrise: ' + sunrise;
            document.getElementById("sunset").innerHTML = 'Sunset: ' + sunset;
            document.getElementById("icon").src = imgUrl;
        }

        if (json.survivalSpeed) {
            survivalSpeed = json.survivalSpeed;
            survivalSpeedText.innerHTML = `Survival Speed: ${survivalSpeed} km/h`
        }
    }
}
startWebsocket()