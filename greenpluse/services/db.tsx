import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Add a new document
export const addItem = async (userId: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, `users/${userId}/items`), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// Get all documents for a user
export const getUserItems = async (userId: string) => {
  try {
    const q = query(collection(db, `users/${userId}/items`));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
};