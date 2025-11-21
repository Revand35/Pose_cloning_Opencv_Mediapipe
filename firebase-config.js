// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLNlvM_w4FbOZsuVTCIsF-JexSnDHGokA",
    authDomain: "posturgo-id.firebaseapp.com",
    databaseURL: "https://posturgo-id-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "posturgo-id",
    storageBucket: "posturgo-id.firebasestorage.app",
    messagingSenderId: "505375945906",
    appId: "1:505375945906:web:37daefc918e333451545ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };

