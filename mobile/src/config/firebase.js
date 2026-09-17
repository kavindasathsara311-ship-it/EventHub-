import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiAiE0wuf8KMUzwW_ySg6SHs9dVvu_TTM",
  authDomain: "eventhub-aa1f5.firebaseapp.com",
  projectId: "eventhub-aa1f5",
  storageBucket: "eventhub-aa1f5.firebasestorage.app",
  messagingSenderId: "490770647672",
  appId: "1:490770647672:web:20e65c53c82c898d83fb8d",
  measurementId: "G-D0GQ31MW97"
};

// Initialize Firebase (safely handling hot-reloading)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

