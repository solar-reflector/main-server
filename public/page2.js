var ws
const firebaseConfig = {
    apiKey: "AIzaSyBoxx31JxnOUq5Yes5vGaCNfiYjMjHHVFs",
    authDomain: "solar-reflector-6320d.firebaseapp.com",
    projectId: "solar-reflector-6320d"
}

const logout = document.querySelector('#logout')
logout.addEventListener('click', () => {
    firebase.auth().signOut()
})

const increase = document.querySelector('#increase')
increase.addEventListener('click', () => {
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: 'increase' }))
})

const decrease = document.querySelector('#decrease')
decrease.addEventListener('click', () => {
    ws.send(JSON.stringify({ topic: 'survivalSpeed', value: 'decrease' }))
})

const tracking = document.querySelector('#tracking')
tracking.addEventListener('click', () => {
    ws.send(JSON.stringify({ topic: 'trackingMode' }))
})

const power = document.querySelector('#power')
power.addEventListener('click', () => {
    ws.send(JSON.stringify({ topic: 'power' }))
})

function startWebsocket() {
    console.log(location.origin.replace(/^http/, 'ws'))
    ws = new WebSocket(location.origin.replace(/^http/, 'ws'))

    ws.onopen = () => {
        console.log("Websocket started")
    }

    ws.onclose = () => {
        console.log("Websocket closed")
        setTimeout(() => { startWebsocket() }, 15000)
    }

    ws.onmessage = event => {
        var json = JSON.parse(event.data)
        console.log(json)

        if (json.hasOwnProperty('weatherData')) {
            let { temp, snowDay, sunrise, sunset, imgUrl } = json.weatherData
            document.getElementById("temp").innerHTML = temp
            document.getElementById("snowfall").innerHTML = 'Next Snowfall: ' + snowDay
            document.getElementById("sunrise").innerHTML = 'Sunrise: ' + sunrise
            document.getElementById("sunset").innerHTML = 'Sunset: ' + sunset
            document.getElementById("icon").src = imgUrl
        }

        if (json.hasOwnProperty('windSpeed')) {
            document.getElementById("windSpeed").innerHTML = 'Wind Speed: ' + json.windSpeed + ' km/h'
        }

        if (json.hasOwnProperty('survivalSpeed')) {
            document.getElementById('survivalSpeed').innerHTML = `Survival Speed: ${json.survivalSpeed} km/h`
            if (json.survivalSpeed <= 10) {
                decrease.disabled = true
            } else if (json.survivalSpeed >= 70) {
                increase.disabled = true
            } else {
                decrease.disabled = false
                increase.disabled = false
            }
        }

        if (json.hasOwnProperty('power')) {
            power.innerHTML = json.power ? 'Turn Off' : 'Turn On'
        }

        if (json.hasOwnProperty('activeTracking')) {
            tracking.innerHTML = json.activeTracking ? 'Active' : 'Auto'
        }

        if (json.hasOwnProperty('state')) {
            document.getElementById("state").innerHTML = 'State: ' + json.state
        }
    }
}
startWebsocket()

firebase.initializeApp(firebaseConfig)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in')
    } else {
        console.log('user logged out')
        window.location.href = "/login"
    }
})