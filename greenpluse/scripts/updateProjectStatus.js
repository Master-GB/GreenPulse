// Script to update project status in Firebase
// Run this with: node scripts/updateProjectStatus.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// Download it from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateProjectStatus(projectId, newStatus) {
  try {
    const projectRef = db.collection('projectRequests').doc(projectId);
    
    await projectRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully updated project ${projectId} to status: ${newStatus}`);
  } catch (error) {
    console.error('❌ Error updating project:', error);
  }
}

// Update the project status
const PROJECT_ID = 'ISb2q1FwfqqyqXL6i7z8';
const NEW_STATUS = 'Approved';

updateProjectStatus(PROJECT_ID, NEW_STATUS)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
