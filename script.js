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

// VALIDATION FUNCTION

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
        // Validate email format
        if (input.type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                alert("Please enter a valid email address.");
                input.focus();
                return false;
            }
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

// FORM SUBMISSION

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validatePage(currentPage)) return;

    try {

        // GET FILES
        const ghanaCardFile = document.getElementById("ghanaCardFile")?.files[0];
        const cvFile = document.getElementById("cvFile")?.files[0];
        const otherFilesInput = document.getElementById("otherFiles")?.files;

        if (!ghanaCardFile || !cvFile) {
            alert("Please upload required files.");
            return;
        }

        // ==============================
        alert("Submitting your application. Please wait...");

        const ghanaCardRef = ref(storage, "ghanaCards/" + Date.now() + "_" + ghanaCardFile.name);
        const cvRef = ref(storage, "cvs/" + Date.now() + "_" + cvFile.name);

        await uploadBytes(ghanaCardRef, ghanaCardFile);
        await uploadBytes(cvRef, cvFile);

        const ghanaCardURL = await getDownloadURL(ghanaCardRef);
        const cvURL = await getDownloadURL(cvRef);


        // OPTIONAL FILES
        let otherFilesURLs = [];

        if (otherFilesInput && otherFilesInput.length > 0) {
            console.log("📎 Uploading other files...");

            for (let file of otherFilesInput) {
                const fileRef = ref(
                    storage,
                    "otherFiles/" + Date.now() + "_" + file.name
                );

                await uploadBytes(fileRef, file);
                const fileURL = await getDownloadURL(fileRef);
                otherFilesURLs.push(fileURL);
            }

        }
        // COLLECT DATA

        const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
            .map(el => el.parentElement.innerText.trim())
            .join(", ");

        const careerLevel = Array.from(document.querySelectorAll('input[name="careerLevel"]:checked'))
            .map(el => el.parentElement.innerText.trim())
            .join(", ");

        const data = {
            fullName: document.getElementById("fullName").value,
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

            ghanaCardURL,
            cvURL,
            otherFiles: otherFilesURLs,

            createdAt: new Date()
        };

        // SAVE TO FIRESTORE
        await addDoc(collection(db, "applications"), data);


        // SUCCESS
        alert("Application submitted successfully!\n\nThank you for applying. We will review your application and get back to you soon.");

        form.reset();
        currentPage = 0;
        showPage(currentPage);

    } catch (error) {
        console.error("❌ FULL ERROR:", error);
        alert("Error: " + error.message);
    }
});
