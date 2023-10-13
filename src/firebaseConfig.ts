// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKCv0naf4iFp9oP4UP5mU6vdwlovSFytc",
  authDomain: "fingerguessing.firebaseapp.com",
  projectId: "fingerguessing",
  storageBucket: "fingerguessing.appspot.com",
  messagingSenderId: "1045985205530",
  appId: "1:1045985205530:web:763221f223280d3688e0a3",
  measurementId: "G-1HGHB0YQ6J",
  databaseURL:
    "https://fingerguessing-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const firebaseAnalytics = getAnalytics(app);
const fireDatabase = getDatabase(app);

export { firebaseAuth, fireDatabase };
