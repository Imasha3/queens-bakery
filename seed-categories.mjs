import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';

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
const db = getFirestore(app);

const INITIAL_CATEGORIES = [
  { name: 'Cakes', description: "Queen's Bakery custom, birthday, and celebration cakes" },
  { name: 'Savoury Items', description: "Freshly baked rolls, pasties, platters, and savoury delights" },
  { name: 'Desserts', description: "Handcrafted tarts, puddings, pastries, and sweet treats" },
  { name: 'Flower Bouquets', description: "Elegant fresh flower arrangements paired with sweet bakes" },
  { name: 'Party Packages', description: "Curated celebration packages for events and special occasions" },
];

async function seedCategories() {
  console.log('Starting Firestore categories collection seeding...');

  for (const cat of INITIAL_CATEGORIES) {
    const docId = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const docRef = doc(db, 'categories', docId);
    
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`[SKIP] Category already exists: "${cat.name}" (id: ${docId})`);
      } else {
        await setDoc(docRef, {
          name: cat.name,
          description: cat.description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`[CREATED] Category successfully created: "${cat.name}" (id: ${docId})`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed processing category "${cat.name}":`, err);
    }
  }

  console.log('Finished categories seeding execution.');
}

seedCategories().catch(console.error);
