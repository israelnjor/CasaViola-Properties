import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const container = document.getElementById("applicationsContainer");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const modal = document.getElementById("detailsModal");
const modalContent = document.getElementById("modalContent");
const logoutBtn = document.getElementById("logoutBtn");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");

let allApplications = [];

// ==============================
// AUTH PROTECTION
// ==============================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadApplications();
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// ==============================
// LOAD APPLICATIONS
// ==============================

async function loadApplications() {
  container.innerHTML = `<div class="empty">Loading applications...</div>`;

  try {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    allApplications = querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));

    updateStats();
    renderApplications(allApplications);

  } catch (error) {
    console.error("Error loading applications:", error);
    container.innerHTML = `<div class="empty">Error loading applications.</div>`;
  }
}

// ==============================
// RENDER APPLICATIONS
// ==============================

function renderApplications(applications) {
  container.innerHTML = "";

  if (applications.length === 0) {
    container.innerHTML = `<div class="empty">No applications found.</div>`;
    return;
  }

  applications.forEach((applicant) => {
    const card = document.createElement("div");
    const status = applicant.status || "pending";

    card.className = "card";

    card.innerHTML = `
      <h3>${safe(applicant.fullName)}</h3>
      <p><strong>Qualification:</strong> ${safe(applicant.education || "Not provided")}</p>
      <p><strong>Email:</strong> ${safe(applicant.email || "Not provided")}</p>

      <div class="card-footer">
        <span class="badge ${status}">${status}</span>
        <span class="date">${formatDate(applicant.createdAt)}</span>
      </div>
    `;

    card.addEventListener("click", () => showDetails(applicant));
    container.appendChild(card);
  });
}

// ==============================
// DETAILS MODAL
// ==============================

function showDetails(applicant) {
  const status = applicant.status || "pending";

  modalContent.innerHTML = `
    <div class="modal-header">
      <div>
        <h2>${safe(applicant.fullName)}</h2>
        <p><span class="badge ${status}">${status}</span></p>
      </div>
      <button class="close-btn" id="closeModalBtn">×</button>
    </div>

    <div class="details-grid">
      ${detail("Email", applicant.email)}
      ${detail("Phone", applicant.phone)}
      ${detail("WhatsApp", applicant.whatsapp)}
      ${detail("Address", applicant.address)}

      ${detail("Highest Education", applicant.education)}
      ${detail("Institution", applicant.institution)}
      ${detail("Year Completed", applicant.yearCompleted)}
      ${detail("Certifications", applicant.certifications)}

      ${detail("Current Employment", applicant.currentEmployment)}
      ${detail("Employer", applicant.employer)}
      ${detail("Position", applicant.position)}
      ${detail("Duration", applicant.duration)}
      ${detail("Monthly Sales Target", applicant.salesTarget)}

      ${detail("Skills", applicant.skills, true)}
      ${detail("Career Level", applicant.careerLevel, true)}
      ${detail("Previous Experience", applicant.previousExperience, true)}
      ${detail("Key Achievements", applicant.keyAchievements, true)}
      ${detail("Motivation", applicant.motivation, true)}
      ${detail("Sales Goal", applicant.salesGoal, true)}
      ${detail("Declaration Name", applicant.fullNameDecl)}
      ${detail("Declaration Date", applicant.dateDecl)}
      ${detail("Applied On", formatDate(applicant.createdAt))}
    </div>

    <div class="file-links">
      ${applicant.cvURL ? `<a href="${applicant.cvURL}" target="_blank">View CV</a>` : ""}
      ${applicant.ghanaCardURL ? `<a href="${applicant.ghanaCardURL}" target="_blank">View Ghana Card</a>` : ""}
      ${renderOtherFiles(applicant.otherFiles)}
    </div>

    <div class="action-row">
      <button class="approve-btn" id="approveBtn">Approve</button>
      <button class="reject-btn" id="rejectBtn">Reject</button>
    </div>
  `;

  modal.classList.add("show");

  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("approveBtn").addEventListener("click", () => updateStatus(applicant.id, "approved"));
  document.getElementById("rejectBtn").addEventListener("click", () => updateStatus(applicant.id, "rejected"));
}

function closeModal() {
  modal.classList.remove("show");
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// ==============================
// APPROVE / REJECT
// ==============================

async function updateStatus(id, status) {
  try {
    await updateDoc(doc(db, "applications", id), {
      status: status
    });

    closeModal();
    await loadApplications();

  } catch (error) {
    console.error("Error updating status:", error);
    alert("Could not update status.");
  }
}

// ==============================
// SEARCH + FILTER
// ==============================

searchInput.addEventListener("input", applyFilters);
filterStatus.addEventListener("change", applyFilters);

function applyFilters() {
  const searchValue = searchInput.value.toLowerCase().trim();
  const statusValue = filterStatus.value;

  let filtered = allApplications.filter((applicant) => {
    const combinedText = `
      ${applicant.fullName || ""}
      ${applicant.email || ""}
      ${applicant.phone || ""}
      ${applicant.education || ""}
      ${applicant.skills || ""}
      ${applicant.careerLevel || ""}
    `.toLowerCase();

    const matchesSearch = combinedText.includes(searchValue);
    const currentStatus = applicant.status || "pending";
    const matchesStatus = statusValue === "all" || currentStatus === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderApplications(filtered);
}

// ==============================
// STATS
// ==============================

function updateStats() {
  const total = allApplications.length;
  const pending = allApplications.filter(app => (app.status || "pending") === "pending").length;
  const approved = allApplications.filter(app => app.status === "approved").length;
  const rejected = allApplications.filter(app => app.status === "rejected").length;

  totalCount.textContent = total;
  pendingCount.textContent = pending;
  approvedCount.textContent = approved;
  rejectedCount.textContent = rejected;
}

// ==============================
// HELPERS
// ==============================

function detail(label, value, full = false) {
  return `
    <div class="detail-box ${full ? "full" : ""}">
      <strong>${label}</strong>
      <span>${safe(value || "Not provided")}</span>
    </div>
  `;
}

function renderOtherFiles(files) {
  if (!files || files.length === 0) return "";

  return files.map((url, index) => {
    return `<a href="${url}" target="_blank">Other File ${index + 1}</a>`;
  }).join("");
}

function formatDate(createdAt) {
  if (!createdAt) return "No date";

  if (createdAt.seconds) {
    return new Date(createdAt.seconds * 1000).toLocaleString();
  }

  return new Date(createdAt).toLocaleString();
}

function safe(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
