
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCJbsdnnL14PogcGblou94A-6ec9h-22ns",
  authDomain: "personal-finance-app-e4d8b.firebaseapp.com",
  projectId: "personal-finance-app-e4d8b",
  storageBucket: "personal-finance-app-e4d8b.firebasestorage.app",
  messagingSenderId: "624653568304",
  appId: "1:624653568304:web:05daf3e38346877bbda0f5",
  measurementId: "G-YH01PWZWW5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
