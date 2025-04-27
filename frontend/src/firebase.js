// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // <-- Add this
import { getAuth } from "firebase/auth"; // if you need authentication
import { getStorage } from "firebase/storage";
// import { getFirestore } from "firebase/firestore"; // if you need database


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKo7CkdMJErOSQmcdlgss95wFZsS6tkRg",
  authDomain: "demo1-delete-later.firebaseapp.com",
  projectId: "demo1-delete-later",
  storageBucket: "demo1-delete-later.firebasestorage.app",
  messagingSenderId: "872508186374",
  appId: "1:872508186374:web:b49d6c39b6d5a666e04887",
  databaseURL: "https://demo1-delete-later-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a database instance
export const db = getDatabase(app);  // Realtime Database


// Export Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app)


// export const db = getFirestore(app); // Cloud Firestore Database