import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - Clés réelles
const firebaseConfig = {
  apiKey: "AIzaSyBP1lvsTkkJAyPy7E11iSBWFO-1EDjFMmQ",
  authDomain: "cvbien-backend.firebaseapp.com",
  projectId: "cvbien-backend",
  storageBucket: "cvbien-backend.firebasestorage.app",
  messagingSenderId: "1036321330651",
  appId: "1:1036321330651:web:55b1d4e9354649d0d903fe"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;