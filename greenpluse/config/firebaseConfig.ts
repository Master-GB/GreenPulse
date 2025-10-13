import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuNCdOpipReVJJak7WG48oLGVl2kZXAAo",
  authDomain: "greenpluse-dc795.firebaseapp.com",
  projectId: "greenpluse-dc795",
  storageBucket: "greenpluse-dc795.firebasestorage.app",
  messagingSenderId: "440074217275",
  appId: "1:440074217275:web:72aa9fe0e2b66f178d791e",
  measurementId: "G-KRWEBHX3JN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

export { auth };

// Export services you'll use
export const db = getFirestore(app);
export const storage = getStorage(app);