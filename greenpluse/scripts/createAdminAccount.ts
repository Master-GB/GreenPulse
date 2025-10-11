/**
 * Script to create the admin account in Firebase
 * Run this once to set up the admin@gmail.com account
 * 
 * Usage: npx ts-node scripts/createAdminAccount.ts
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBuNCdOpipReVJJak7WG48oLGVl2kZXAAo",
  authDomain: "greenpluse-dc795.firebaseapp.com",
  projectId: "greenpluse-dc795",
  storageBucket: "greenpluse-dc795.firebasestorage.app",
  messagingSenderId: "440074217275",
  appId: "1:440074217275:web:72aa9fe0e2b66f178d791e",
  measurementId: "G-KRWEBHX3JN"
};

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678';

async function createAdminAccount() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('Creating admin account...');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    console.log('\n✅ Admin account created successfully!');
    console.log(`User ID: ${userCredential.user.uid}`);
    console.log(`Email: ${userCredential.user.email}`);
    console.log('\nYou can now sign in with:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n✅ Admin account already exists!');
      console.log('You can sign in with:');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      process.exit(0);
    } else {
      console.error('\n❌ Error creating admin account:', error.message);
      console.error('Error code:', error.code);
      process.exit(1);
    }
  }
}

createAdminAccount();
