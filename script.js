import { storage, db } from "./firebase.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==============================
// MULTI-STEP FORM NAVIGATION
// ==============================

const formPages = document.querySelectorAll(".form-page");
let currentPage = 0;

const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const form = document.getElementById("applicationForm");

if (formPages.length > 0) {
  formPages[currentPage].classList.add("active");
}

function showPage(index) {
  formPages.forEach((page, i) => {
    page.classList.remove("active");
    if (i === index) page.classList.add("active");
  });
  window.scrollTo(0, 0);
}

nextBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (validatePage(currentPage)) {
      currentPage++;
      if (currentPage >= formPages.length) {
        currentPage = formPages.length - 1;
      }
      showPage(currentPage);
    }
  });
});

prevBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPage--;
    if (currentPage < 0) currentPage = 0;
    showPage(currentPage);
  });
});

// ==============================
// VALIDATION
// ==============================

function validatePage(index) {
  const page = formPages[index];

  const inputs = page.querySelectorAll(
    "input:not([type='checkbox'])[required], select[required], textarea[required]"
  );

  for (let input of inputs) {
    if (input.value.trim() === "") {
      alert("Please complete all required fields.");
      input.focus();
      return false;
    }

    if (input.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        alert("Please enter a valid email address.");
        input.focus();
        return false;
      }
    }
  }

  if (page.id === "page4") {
    const skillsChecked = page.querySelectorAll('input[name="skills"]:checked');
    if (skillsChecked.length === 0) {
      alert("Please select at least one skill.");
      return false;
    }
  }

  if (page.id === "page5") {
    const careerChecked = page.querySelectorAll('input[name="careerLevel"]:checked');
    if (careerChecked.length === 0) {
      alert("Please select at least one career level.");
      return false;
    }
  }

  return true;
}

// ==============================
// UI HELPERS
// ==============================

function createSubmitOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "submitOverlay";
  overlay.innerHTML = `
    <div class="submit-box">
      <div class="spinner"></div>
      <h3>Submitting Application</h3>
      <p>Please wait while we upload your files and save your application.</p>
    </div>
  `;

  const style = document.createElement("style");
  style.innerHTML = `
    #submitOverlay {
      position: fixed;
      inset: 0;
      background: rgba(43, 10, 61, 0.82);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(6px);
    }

    #submitOverlay.show {
      display: flex;
    }

    .submit-box {
      background: #fff;
      color: #2B0A3D;
      padding: 35px 30px;
      border-radius: 18px;
      text-align: center;
      width: 90%;
      max-width: 420px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
      animation: popIn 0.35s ease;
      border-top: 6px solid #D4A017;
    }

    .submit-box h3 {
      margin: 15px 0 8px;
      font-size: 1.4rem;
    }

    .submit-box p {
      margin: 0;
      color: #555;
      line-height: 1.5;
    }

    .spinner {
      width: 55px;
      height: 55px;
      border: 5px solid #eee;
      border-top: 5px solid #D4A017;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes popIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  document.body.appendChild(style);
  document.body.appendChild(overlay);
}

function showSubmitting() {
  const overlay = document.getElementById("submitOverlay");
  if (overlay) overlay.classList.add("show");
}

function hideSubmitting() {
  const overlay = document.getElementById("submitOverlay");
  if (overlay) overlay.classList.remove("show");
}

function showSuccessAnimation() {
  const overlay = document.getElementById("submitOverlay");

  if (!overlay) {
    alert("Application submitted successfully!");
    return;
  }

  overlay.innerHTML = `
    <div class="submit-box">
      <div style="
        width: 70px;
        height: 70px;
        margin: 0 auto 15px;
        border-radius: 50%;
        background: #D4A017;
        color: #2B0A3D;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 38px;
        font-weight: bold;
        animation: popIn 0.35s ease;
      ">✓</div>

      <h3>Application Submitted!</h3>
      <p>Thank you for applying. Casa Viola Properties will review your application and get back to you soon.</p>
    </div>
  `;

  overlay.classList.add("show");

  setTimeout(() => {
    overlay.classList.remove("show");

    setTimeout(() => {
      overlay.innerHTML = `
        <div class="submit-box">
          <div class="spinner"></div>
          <h3>Submitting Application</h3>
          <p>Please wait while we upload your files and save your application.</p>
        </div>
      `;
    }, 400);
  }, 2800);
}

createSubmitOverlay();

// ==============================
// FORM SUBMISSION
// ==============================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validatePage(currentPage)) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : "";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";
    }

    showSubmitting();

    const ghanaCardFile = document.getElementById("ghanaCardFile")?.files[0];
    const cvFile = document.getElementById("cvFile")?.files[0];
    const otherFilesInput = document.getElementById("otherFiles")?.files;

    if (!ghanaCardFile || !cvFile) {
      hideSubmitting();
      alert("Please upload required files.");
      return;
    }

    const safeTime = Date.now();

    const ghanaCardRef = ref(
      storage,
      "ghanaCards/" + safeTime + "_" + ghanaCardFile.name
    );

    const cvRef = ref(
      storage,
      "cvs/" + safeTime + "_" + cvFile.name
    );

    await uploadBytes(ghanaCardRef, ghanaCardFile);
    await uploadBytes(cvRef, cvFile);

    const ghanaCardURL = await getDownloadURL(ghanaCardRef);
    const cvURL = await getDownloadURL(cvRef);

    let otherFilesURLs = [];

    if (otherFilesInput && otherFilesInput.length > 0) {
      for (let file of otherFilesInput) {
        const fileRef = ref(
          storage,
          "otherFiles/" + Date.now() + "_" + Math.random().toString(36).substring(2) + "_" + file.name
        );

        await uploadBytes(fileRef, file);
        const fileURL = await getDownloadURL(fileRef);
        otherFilesURLs.push(fileURL);
      }
    }

    const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
      .map(el => el.parentElement.innerText.trim())
      .join(", ");

    const careerLevel = Array.from(document.querySelectorAll('input[name="careerLevel"]:checked'))
      .map(el => el.parentElement.innerText.trim())
      .join(", ");

    const data = {
      fullName: document.getElementById("fullName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      whatsapp: document.getElementById("whatsapp").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),

      education: document.getElementById("education").value,
      institution: document.getElementById("institution").value.trim(),
      yearCompleted: document.getElementById("yearCompleted").value,
      certifications: document.getElementById("certifications").value.trim(),

      currentEmployment: document.getElementById("currentEmployment").value.trim(),
      employer: document.getElementById("employer").value.trim(),
      position: document.getElementById("position").value.trim(),
      duration: document.getElementById("duration").value.trim(),
      salesTarget: document.getElementById("salesTarget").value.trim(),

      previousExperience: document.getElementById("previousExperience").value.trim(),
      keyAchievements: document.getElementById("keyAchievements").value.trim(),

      skills,
      careerLevel,

      motivation: document.getElementById("motivation").value.trim(),
      salesGoal: document.getElementById("salesGoal").value.trim(),

      fullNameDecl: document.getElementById("fullNameDecl").value.trim(),
      dateDecl: document.getElementById("dateDecl").value,

      status: "pending",

      ghanaCardURL,
      cvURL,
      otherFiles: otherFilesURLs,

      createdAt: new Date()
    };

    await addDoc(collection(db, "applications"), data);

    form.reset();
    currentPage = 0;
    showPage(currentPage);

    showSuccessAnimation();

  } catch (error) {
    console.error("❌ FULL ERROR:", error);
    hideSubmitting();
    alert("Error: " + error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText || "Submit Application";
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    }
  }
});
