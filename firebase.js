// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "AIzaSyDm2nMS4EVVbp_0gzQOVr7ph1ckM6mF24w",
  authDomain: "casaviola-final.firebaseapp.com",
  projectId: "casaviola-final",
  storageBucket: "casaviola-final.appspot.com",
  messagingSenderId: "1047113639506",
  appId: "1:1047113639506:web:6d2ab4470a53f2ff30e18b"
};
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);