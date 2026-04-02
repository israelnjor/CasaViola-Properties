// Get all form pages
const formPages = document.querySelectorAll(".form-page");
let currentPage = 0;

// Show the first page
formPages[currentPage].classList.add("active");

// Buttons
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const form = document.getElementById("applicationForm");

// Function to show a page
function showPage(index) {
    formPages.forEach((page, i) => {
        page.classList.remove("active");
        if(i === index) page.classList.add("active");
    });
    window.scrollTo(0, 0); // Scroll to top on page change
}

// Next button click
nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        // Validate current page inputs before moving forward
        if(validatePage(currentPage)) {
            currentPage++;
            if(currentPage >= formPages.length) currentPage = formPages.length - 1;
            showPage(currentPage);
        }
    });
});

// Previous button click
prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        currentPage--;
        if(currentPage < 0) currentPage = 0;
        showPage(currentPage);
    });
});

// Page validation function
function validatePage(index) {
    const inputs = formPages[index].querySelectorAll("input[required], select[required], textarea[required]");
    for(let input of inputs) {
        if(input.type === "checkbox" && !input.checked) {
            alert("Please complete all required fields on this page.");
            return false;
        } else if(input.value.trim() === "") {
            alert("Please complete all required fields on this page.");
            input.focus();
            return false;
        }
    }
    return true;
}

// Form submission
form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validatePage(currentPage)) return;

    const url = "https://script.google.com/macros/s/AKfycbxav0cgAL0cIgJDdeGzfnTm-ET6Ybdzxn2FUIdjLbDGF7z6ZgzPMUF3Yq45mLfvcnpJ/exec";

    // ✅ Collect checkboxes (ONLY ONCE, INSIDE submit)
    const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
        .map(el => el.parentElement.innerText.trim())
        .join(", ");

    const careerLevel = Array.from(document.querySelectorAll('input[name="careerLevel"]:checked'))
        .map(el => el.parentElement.innerText.trim())
        .join(", ");

    // ✅ Send data
    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
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
            dateDecl: document.getElementById("dateDecl").value
        })
    })
    .then(() => {
        // ✅ Success feedback (since no-cors doesn't return response)
        setTimeout(() => {
            alert("Application submitted successfully!");
            form.reset();
            currentPage = 0;
            showPage(currentPage);
        }, 1000);
    })
    .catch(err => {
        console.error(err);
        alert("Error submitting form");
    });
});