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
        window.location.href = "/"
    } else {
        console.log('user logged out');
    }
});

const signupForm = document.querySelector('#loginForm');
signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = signupForm['email'].value;
    const password = signupForm['password'].value;

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            console.log(error.message);
        });
});

const ws = new WebSocket(location.origin.replace(/^http/, 'ws'))
const switchTheme = document.querySelector('#switchTheme')
const theme = document.querySelector('#theme')
switchTheme.addEventListener('click', event => {
    if (theme.getAttribute("href") == 'page1.css') {
        theme.href = 'page1_dark.css'
    } else {
        theme.href = 'page1.css'
    }
    ws.send(JSON.stringify({ topic: 'darkMode' }))
})
