// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // <-- Add this
import { getAuth } from "firebase/auth"; // if you need authentication
import { getStorage } from "firebase/storage";
import {  GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // if you need database


// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBKo7CkdMJErOSQmcdlgss95wFZsS6tkRg",
//   authDomain: "demo1-delete-later.firebaseapp.com",
//   projectId: "demo1-delete-later",
//   storageBucket: "demo1-delete-later.firebasestorage.app",
//   messagingSenderId: "872508186374",
//   appId: "1:872508186374:web:b49d6c39b6d5a666e04887",
//   databaseURL: "https://demo1-delete-later-default-rtdb.asia-southeast1.firebasedatabase.app"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAoZqwTAD3tGS7yIiQkqdhsRnh2E8GpaSE",
  authDomain: "looptalk-project.firebaseapp.com",
  projectId: "looptalk-project",
  storageBucket: "looptalk-project.firebasestorage.app",
  messagingSenderId: "905805547039",
  appId: "1:905805547039:web:628c2c32c9ac5820e7772a",
  databaseURL:"https://looptalk-project-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a database instance
export const realtimeDB  = getDatabase(app);  // Realtime Database


// Export Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider();


export const firestoreDB = getFirestore(app); // Cloud Firestore Database