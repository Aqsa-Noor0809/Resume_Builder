"use strict";

// DOM Elements
const form = document.getElementById("resume-form");
const resumePage = document.getElementById("resumePage");
const resumePhoto = document.getElementById("resumePhoto");
const resumeName = document.getElementById("resumeName");
const resumeEmail = document.getElementById("resumeEmail");
const resumePhone = document.getElementById("resumePhone");
const resumeEducation = document.getElementById("resumeEducation");
const resumeSkills = document.getElementById("resumeSkills");
const resumeExperience = document.getElementById("resumeExperience");
const editButton = document.getElementById("editButton");
const resumeShareLink = document.getElementById("resumeShareLink");
const downloadButton = document.getElementById("download");
const resumeContent = document.getElementById("resumeContant");

// Form Submission
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = {
    name: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    degree: document.getElementById("degree").value,
    education: document.getElementById("institute").value,
    skills: document.getElementById("skills").value,
    workExperience: document.getElementById("workExperience").value,
  };

  const photoInput = document.getElementById("photo");
  if (photoInput.files?.[0]) {
    fileToBase64(photoInput.files[0]).then((base64) => {
      formData.photoBase64 = base64;
      localStorage.setItem("resumePhoto", formData.photoBase64);
      resumePhoto.src = formData.photoBase64;
      updateResumePage(formData);
      toggleView(true);

      // Generate and copy the shareable link
      const queryParams = new URLSearchParams(formData).toString();
      const uniqueUrl = `${window.location.origin}${window.location.pathname}?${queryParams}`;
      resumeShareLink.addEventListener("click", () => {
        navigator.clipboard.writeText(uniqueUrl);
        alert("The link is copied to your clipboard!");
      });

      window.history.replaceState(null, "", `?${queryParams}`);
    });
  } else {
    updateResumePage(formData);
    toggleView(true);

    // Generate and copy the shareable link
    const queryParams = new URLSearchParams(formData).toString();
    const uniqueUrl = `${window.location.origin}${window.location.pathname}?${queryParams}`;
    resumeShareLink.addEventListener("click", () => {
      navigator.clipboard.writeText(uniqueUrl);
      alert("The link is copied to your clipboard!");
    });

    window.history.replaceState(null, "", `?${queryParams}`);
  }
});

// Toggle between form and resume views
function toggleView(showResume) {
  document.querySelector(".container")?.classList.toggle("hidden", showResume);
  resumePage.classList.toggle("hidden", !showResume);
}

// Update Resume Page Content
function updateResumePage(data) {
  resumeName.textContent = data.name;
  resumeEmail.textContent = `Email: ${data.email}`;
  resumePhone.textContent = `Phone: ${data.phone}`;
  resumeEducation.textContent = `${data.degree} from ${data.education}`;

  // Display skills as a list (for the webpage)
  resumeSkills.innerHTML = ""; // Clear existing content
  const skillsArray = data.skills.split(",").map((skill) => skill.trim());
  skillsArray.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    resumeSkills.appendChild(li);
  });

  // Display experience with line breaks (for the webpage)
  resumeExperience.innerHTML = data.workExperience.replace(/\n/g, "<br>");

  // Create a hidden div for PDF rendering
  const pdfSkills = document.createElement("div");
  pdfSkills.style.display = "none"; // Hide from the webpage
  pdfSkills.id = "pdfSkills";
  pdfSkills.textContent = `Skills: ${skillsArray.join(", ")}`; // Plain text for PDF
  resumeContent.appendChild(pdfSkills);

  const pdfExperience = document.createElement("div");
  pdfExperience.style.display = "none"; // Hide from the webpage
  pdfExperience.id = "pdfExperience";
  pdfExperience.textContent = `Experience:\n${data.workExperience.replace(/\n/g, "\n")}`; // Plain text with line breaks for PDF
  resumeContent.appendChild(pdfExperience);
}

// Convert File to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Edit Button
editButton.addEventListener("click", () => {
  populateFormFromResume();
  toggleView(false);
});

function populateFormFromResume() {
  const [degree, education] = resumeEducation.textContent?.split("from") || ["", ""];

  document.getElementById("fullName").value = resumeName.textContent || "";
  document.getElementById("email").value = resumeEmail.textContent?.replace("Email: ", "") || "";
  document.getElementById("phone").value = resumePhone.textContent?.replace("Phone: ", "") || "";
  document.getElementById("degree").value = degree.trim() || "";
  document.getElementById("institute").value = education.trim() || "";
  document.getElementById("skills").value = Array.from(resumeSkills.children)
    .map((li) => li.textContent)
    .join(", ");
  document.getElementById("workExperience").value = resumeExperience.textContent || "";
}

// Download PDF Button
downloadButton.addEventListener("click", () => {
  if (typeof html2pdf === "undefined") {
    alert("Error: html2pdf library is not loaded.");
    return;
  }

  // Temporarily show the resume page if it's hidden
  const isResumeHidden = resumePage.classList.contains("hidden");
  if (isResumeHidden) {
    toggleView(true);
  }

  // Temporarily show all hidden elements
  const hiddenElements = document.querySelectorAll("[style*='display: none']");
  hiddenElements.forEach((element) => {
    element.style.display = "block";
  });

  // Add a small delay to ensure all content is fully rendered
  setTimeout(() => {
    const options = {
      margin: 0.5,
      filename: "Resume.pdf",
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .from(resumeContent)
      .set(options)
      .save()
      .then(() => {
        // Hide the resume page again if it was hidden
        if (isResumeHidden) {
          toggleView(false);
        }

        // Hide the temporarily shown elements
        hiddenElements.forEach((element) => {
          element.style.display = "none";
        });
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
      });
  }, 500); // 500ms delay
});

// On Page Load
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const formData = {
    name: params.get("name") || "",
    email: params.get("email") || "",
    phone: params.get("phone") || "",
    degree: params.get("degree") || "",
    education: params.get("education") || "",
    skills: params.get("skills") || "",
    workExperience: params.get("workExperience") || "",
  };

  const savedPhoto = localStorage.getItem("resumePhoto");
  if (savedPhoto) {
    resumePhoto.src = savedPhoto;
  }

  if (Object.values(formData).some((value) => value)) {
    updateResumePage(formData);
    toggleView(true);
  }
});

// Styling for Resume Photo
resumePhoto.style.cssText = `
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
`;