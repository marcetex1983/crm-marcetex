import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3kBbXYP7OOs3Vy7wt4y-Mlvwzw98f9nM",
  authDomain: "crm-marcetex-2024.firebaseapp.com",
  projectId: "crm-marcetex-2024",
  storageBucket: "crm-marcetex-2024.firebasestorage.app",
  messagingSenderId: "832892599637",
  appId: "1:832892599637:web:d96298e00902782f2b03dc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
