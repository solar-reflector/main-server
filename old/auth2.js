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

const logout = document.querySelector('#logout');
logout.addEventListener('click', (event) => {
    auth.signOut();
});
