// IMPORT AUTH
import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔐 PROTECT PAGE
onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Access denied. Please login.");
        window.location.href = "login.html";
    } else {
        console.log("Admin logged in:", user.email);
        loadApplications(); // only run AFTER auth
    }
});
// END PROTECT PAGE

import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const container = document.getElementById("applicationsContainer");

async function loadApplications() {
    container.innerHTML = "Loading...";

    try {
        const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        container.innerHTML = "";

        querySnapshot.forEach(doc => {
            const data = doc.data();

            const card = document.createElement("div");
            card.style.border = "1px solid #ccc";
            card.style.padding = "15px";
            card.style.marginBottom = "10px";
            card.classList.add("card"); //  THIS


            card.innerHTML = `
                <h3>${data.fullName}</h3>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Skills:</strong> ${data.skills}</p>
                <p><strong>Career Level:</strong> ${data.careerLevel}</p>

                <p>
                  <a href="${data.cvURL}" target="_blank">📄 View CV</a> |
                  <a href="${data.ghanaCardURL}" target="_blank">🪪 Ghana Card</a>
                </p>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = "Error loading applications";
    }
}

loadApplications();