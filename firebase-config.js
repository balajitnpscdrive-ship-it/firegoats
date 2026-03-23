/**
 * FIREBASE CONFIGURATION TEMPLATE
 * Replace the config values below with your project credentials from the Firebase Console.
 */
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, collection, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHQcElpwAUrMt_JCjJCcieZqXADiXyZEQ",
  authDomain: "college-house-system.firebaseapp.com",
  projectId: "college-house-system",
  storageBucket: "college-house-system.firebasestorage.app",
  messagingSenderId: "998894665708",
  appId: "1:998894665708:web:478976768bdcc8b8774ac9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// Export instances to global window for script.js
window.db = db;
window.storage = storage;
window.fbUtils = {
    doc, onSnapshot, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, ref, uploadBytes, getDownloadURL
};
console.log("Firebase Initialized Layer Loaded");
