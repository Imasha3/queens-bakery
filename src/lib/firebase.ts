import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBuMqJ8LkwWaIPjQqsKAiH49r7SvvDCf0A",
  authDomain: "queens-bakery-d15db.firebaseapp.com",
  projectId: "queens-bakery-d15db",
  storageBucket: "queens-bakery-d15db.firebasestorage.app",
  messagingSenderId: "936359327670",
  appId: "1:936359327670:web:60e086fd630f6276feb317",
  measurementId: "G-91W15SS6NJ",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;