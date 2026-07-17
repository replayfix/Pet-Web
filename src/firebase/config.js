// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtLiMmWh7qjav0oTdfjhf3ZmWMJ42NemQ",
  authDomain: "pet-web-5ccb1.firebaseapp.com",
  projectId: "pet-web-5ccb1",
  storageBucket: "pet-web-5ccb1.firebasestorage.app",
  messagingSenderId: "534840842756",
  appId: "1:534840842756:web:c749e5e63339a608013351",
  measurementId: "G-LSE5K4KG61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
