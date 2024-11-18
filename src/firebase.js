import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAZ4OWGg8gtBbZ2ULE-b7-tjNxGQGQs6E",
  authDomain: "get-together-b52a1.firebaseapp.com",
  projectId: "get-together-b52a1",
  storageBucket: "get-together-b52a1.firebasestorage.app",
  messagingSenderId: "139886868830",
  appId: "1:139886868830:web:1d12bf09f3f1f27fd5b7cf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };