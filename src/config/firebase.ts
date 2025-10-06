import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - Remplace par tes vraies clés
const firebaseConfig = {
  apiKey: "AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ", // Remplace par ta vraie clé API
  authDomain: "cvbien-backend.firebaseapp.com", // Remplace par ton domaine
  projectId: "cvbien-backend", // Remplace par ton project ID
  storageBucket: "cvbien-backend.appspot.com", // Remplace par ton storage bucket
  messagingSenderId: "123456789012", // Remplace par ton sender ID
  appId: "1:123456789012:web:abcdef1234567890abcdef" // Remplace par ton app ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;