// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhJQ_R1J4G8EcTaQZawsN7-ho4-g-myvI",
  authDomain: "firecloud-84d68.firebaseapp.com",
  databaseURL: "https://firecloud-84d68-default-rtdb.firebaseio.com",
  projectId: "firecloud-84d68",
  storageBucket: "firecloud-84d68.firebasestorage.app",
  messagingSenderId: "878306713480",
  appId: "1:878306713480:web:07f1c967fff6ad03a4a43d",
  measurementId: "G-SLQ7RBEQEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const realtimedb = getDatabase(app);

export { app, realtimedb};