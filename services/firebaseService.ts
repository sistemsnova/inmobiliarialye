import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Esto es vital
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// ESTAS LÍNEAS SON LAS QUE HACEN LA MAGIA DE LA SINCRONIZACIÓN
export const db = getFirestore(app); 
export const auth = getAuth(app);
export default app;