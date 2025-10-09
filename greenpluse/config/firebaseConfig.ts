import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, Auth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore - React Native persistence
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';

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

// Initialize Auth with AsyncStorage persistence for React Native
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };

// Export services you'll use
export const db = getFirestore(app);
export const storage = getStorage(app);