// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "casaviola-final.firebaseapp.com",
  projectId: "casaviola-final",
  storageBucket: "casaviola-final-1b458.firebasestorage.app", // ✅ FIXED
  messagingSenderId: "1047113639506",
  appId: "1:1047113639506:web:..."
};
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);