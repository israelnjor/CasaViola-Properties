import { storage, db } from "./firebase.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";// ==============================


// MULTI-STEP FORM NAVIGATION
// ==============================

// Get all form pages
const formPages = document.querySelectorAll(".form-page");
let currentPage = 0;

// Show first page
formPages[currentPage].classList.add("active");

// Buttons
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const form = document.getElementById("applicationForm");

// Show specific page
function showPage(index) {
    formPages.forEach((page, i) => {
        page.classList.remove("active");
        if (i === index) page.classList.add("active");
    });
    window.scrollTo(0, 0);
}

// Next buttons
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

// Previous buttons
prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        currentPage--;
        if (currentPage < 0) currentPage = 0;
        showPage(currentPage);
    });
});

// ==============================
// VALIDATION FUNCTION
// ==============================

function validatePage(index) {
    const page = formPages[index];

    // Validate normal inputs
    const inputs = page.querySelectorAll(
        "input:not([type='checkbox'])[required], select[required], textarea[required]"
    );

    for (let input of inputs) {
        if (input.value.trim() === "") {
            alert("Please complete all required fields.");
            input.focus();
            return false;
        }
    }

    // ✅ Handle SKILLS (page 4)
    if (page.id === "page4") {
        const skillsChecked = page.querySelectorAll('input[name="skills"]:checked');
        if (skillsChecked.length === 0) {
            alert("Please select at least one skill.");
            return false;
        }
    }

    // ✅ Handle CAREER LEVEL (page 5)
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
// FORM SUBMISSION
// ==============================

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validatePage(currentPage)) return;

    try {

        // =========================
        // GET FILES
        // =========================
        const ghanaCardFile = document.getElementById("ghanaCardFile").files[0];
        const cvFile = document.getElementById("cvFile").files[0];

        // =========================
        // UPLOAD GHANA CARD
        // =========================
        const ghanaCardRef = ref(storage, "ghanaCards/" + Date.now() + "_" + ghanaCardFile.name);
        await uploadBytes(ghanaCardRef, ghanaCardFile);
        const ghanaCardURL = await getDownloadURL(ghanaCardRef);

        // =========================
        // UPLOAD CV
        // =========================
        const cvRef = ref(storage, "cvs/" + Date.now() + "_" + cvFile.name);
        await uploadBytes(cvRef, cvFile);
        const cvURL = await getDownloadURL(cvRef);

        // =========================
        // CHECKBOX VALUES
        // =========================
        const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
            .map(el => el.parentElement.innerText.trim())
            .join(", ");

        const careerLevel = Array.from(document.querySelectorAll('input[name="careerLevel"]:checked'))
            .map(el => el.parentElement.innerText.trim())
            .join(", ");

        // =========================
        // SAVE TO FIRESTORE
        // =========================
        await addDoc(collection(db, "applications"), {
            fullName: document.getElementById("fullName").value,
            ghanaCard: document.getElementById("ghanaCard").value,
            phone: document.getElementById("phone").value,
            whatsapp: document.getElementById("whatsapp").value,
            email: document.getElementById("email").value,
            address: document.getElementById("address").value,

            education: document.getElementById("education").value,
            institution: document.getElementById("institution").value,
            yearCompleted: document.getElementById("yearCompleted").value,
            certifications: document.getElementById("certifications").value,

            currentEmployment: document.getElementById("currentEmployment").value,
            employer: document.getElementById("employer").value,
            position: document.getElementById("position").value,
            duration: document.getElementById("duration").value,
            salesTarget: document.getElementById("salesTarget").value,

            previousExperience: document.getElementById("previousExperience").value,
            keyAchievements: document.getElementById("keyAchievements").value,

            skills: skills,
            careerLevel: careerLevel,

            motivation: document.getElementById("motivation").value,
            salesGoal: document.getElementById("salesGoal").value,

            fullNameDecl: document.getElementById("fullNameDecl").value,
            dateDecl: document.getElementById("dateDecl").value,

            // 🔥 FILE LINKS
            ghanaCardFileURL: ghanaCardURL,
            cvFileURL: cvURL,

            createdAt: new Date()
        });

        // =========================
        // SUCCESS
        // =========================
        alert("Application submitted successfully!");

        form.reset();
        currentPage = 0;
        showPage(currentPage);

    } catch (error) {
        console.error(error);
        alert("Error submitting application");
    }
});


// form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     if (!validatePage(currentPage)) return;

//     const url = "https://script.google.com/macros/s/AKfycbwf0iUfJ8sgRie4jFrH-3WlfGhOeoJ7MBEnmGXOOf7pNJsPPkT5foue6o7xBEIR4pi3/exec";

//     // Collect checkbox values
//     const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
//         .map(el => el.parentElement.innerText.trim())
//         .join(", ");

//     const careerLevel = Array.from(document.querySelectorAll('input[name="careerLevel"]:checked'))
//         .map(el => el.parentElement.innerText.trim())
//         .join(", ");

//     // Create FormData
//     const formData = new FormData();

//     formData.append("fullName", document.getElementById("fullName").value);
//     formData.append("ghanaCard", document.getElementById("ghanaCard").value);
//     formData.append("phone", document.getElementById("phone").value);
//     formData.append("whatsapp", document.getElementById("whatsapp").value);
//     formData.append("email", document.getElementById("email").value);
//     formData.append("address", document.getElementById("address").value);

//     formData.append("education", document.getElementById("education").value);
//     formData.append("institution", document.getElementById("institution").value);
//     formData.append("yearCompleted", document.getElementById("yearCompleted").value);
//     formData.append("certifications", document.getElementById("certifications").value);

//     formData.append("currentEmployment", document.getElementById("currentEmployment").value);
//     formData.append("employer", document.getElementById("employer").value);
//     formData.append("position", document.getElementById("position").value);
//     formData.append("duration", document.getElementById("duration").value);
//     formData.append("salesTarget", document.getElementById("salesTarget").value);

//     formData.append("previousExperience", document.getElementById("previousExperience").value);
//     formData.append("keyAchievements", document.getElementById("keyAchievements").value);

//     formData.append("skills", skills);
//     formData.append("careerLevel", careerLevel);

//     formData.append("motivation", document.getElementById("motivation").value);
//     formData.append("salesGoal", document.getElementById("salesGoal").value);

//     formData.append("fullNameDecl", document.getElementById("fullNameDecl").value);
//     formData.append("dateDecl", document.getElementById("dateDecl").value);


//    //  from here
//     const ghanaCardFileInput = document.getElementById("ghanaCardFile");
//     if (ghanaCardFileInput.files.length > 0) {
//        formData.append("ghanaCardFile", ghanaCardFileInput.files[0]);
//     }

//     const cvFileInput = document.getElementById("cvFile");
//     if (cvFileInput.files.length > 0) {
//       formData.append("cvFile", cvFileInput.files[0]);
//     }

//     const otherFilesInput = document.getElementById("otherFiles");
//     for (let i = 0; i < otherFilesInput.files.length; i++) {
//     formData.append("otherFiles" + i, otherFilesInput.files[i]);
//     }

// // to here
//     // Send data to Google Sheets
//     fetch(url, {
//         method: "POST",
//       //   mode: "no-cors",
//         body: formData
//     })
//     .then(() => {
//         setTimeout(() => {
//             alert("Application submitted successfully!");
//             form.reset();
//             currentPage = 0;
//             showPage(currentPage);
//         }, 1000);
//     })
//     .catch(err => {
//         console.error(err);
//         alert("Error submitting form");
//     });
// });