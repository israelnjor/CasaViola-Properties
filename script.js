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

    // Final validation
    if(!validatePage(currentPage)) return;

    // Collect form data
    const formData = new FormData(form);

    // Here you can send the formData to Firebase, server, or API
    // For demo, we'll log it
    console.log("Form submitted successfully!");
    for (let [key, value] of formData.entries()) {
        console.log(key, ":", value);
    }

    alert("Application submitted successfully! Thank you for applying.");
    form.reset();
    currentPage = 0;
    showPage(currentPage);
});