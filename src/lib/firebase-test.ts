import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "./firebase";

export async function testFirebaseConnection() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    console.log("Firebase connected. Products:", snapshot.size);
  } catch (error) {
    console.error("Firebase connection failed:", error);
  }
}