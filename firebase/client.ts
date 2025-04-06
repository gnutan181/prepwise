// Import the functions you need from the SDKs you need
import { initializeApp ,getApp, getApps} from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyApmY8jlQxBb5bYYT7eyQogtiq2V0i06us",
  authDomain: "prepwise-61b31.firebaseapp.com",
  projectId: "prepwise-61b31",
  storageBucket: "prepwise-61b31.firebasestorage.app",
  messagingSenderId: "336875823409",
  appId: "1:336875823409:web:d7ecbed331b5cb52b8d010",
  measurementId: "G-1QV8R8KXYC"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig):getApp();
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };

// Initialize Firebase
