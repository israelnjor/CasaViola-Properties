// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjhg1DOd3Fil4inlvubaBeUjzs3ceUYwc",
  authDomain: "casaviola-final-1b458.firebaseapp.com",
  projectId: "casaviola-final-1b458",
  storageBucket: "casaviola-final-1b458.firebasestorage.app",
  messagingSenderId: "393408104853",
  appId: "1:393408104853:web:1fde63c241acecb3584e9c"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
