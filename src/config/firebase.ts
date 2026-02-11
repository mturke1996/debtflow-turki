import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - م. محمد سالم التركي
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1iM0be62FUI6CQKj-O_60wh_9QGrOu1E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mohturki-b8344.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mohturki-b8344",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mohturki-b8344.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "333833076051",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:333833076051:web:7684cd69bbfb362f45b5a6",
  measurementId: "G-93QJJCNR2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
