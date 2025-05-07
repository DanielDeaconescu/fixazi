// Replace Text In Header
const checkReplace = document.querySelector(".replace-me");

if (checkReplace !== null) {
  const replace = new ReplaceMe(checkReplace, {
    animation: "animated fadeIn",
    speed: 2000,
    separator: ",",
    loopCount: "infinite",
    autoRun: true,
  });
}

// User Scroll For Navbar
function userScroll() {
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("bg-dark");
      navbar.classList.add("border-bottom");
      navbar.classList.add("border-secondary");
      navbar.classList.add("navbar-sticky");
    } else {
      navbar.classList.remove("bg-dark");
      navbar.classList.remove("border-bottom");
      navbar.classList.remove("border-secondary");
      navbar.classList.remove("navbar-sticky");
    }
  });
}

document.addEventListener("DOMContentLoaded", userScroll);

// Video Modal
const videoBtn = document.querySelector(".video-btn");
const videoModal = document.querySelector("#videoModal");
const video = document.querySelector("#video");
let videoSrc;

if (videoBtn !== null) {
  videoBtn.addEventListener("click", () => {
    videoSrc = videoBtn.getAttribute("data-bs-src");
  });
}

if (videoModal !== null) {
  videoModal.addEventListener("shown.bs.modal", () => {
    video.setAttribute(
      "src",
      videoSrc + "?autoplay=1;modestbranding=1;showInfo=0"
    );
  });

  videoModal.addEventListener("hide.bs.modal", () => {
    video.setAttribute("src", videoSrc);
  });
}

// reset form when modal is closed

const repairModal = document.getElementById("formModal");
const repairForm = document.getElementById("repairForm");

repairModal.addEventListener("hidden.bs.modal", function () {
  // Reset the form
  repairForm.reset();

  // Clear error messages
  document.getElementById("fullNameError").textContent = "";
  document.getElementById("phoneError").textContent = "";
});

// form validation
// form validation and submission
document
  .getElementById("repairForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // Stop default form submission

    // Clear previous errors
    document.getElementById("fullNameError").textContent = "";
    document.getElementById("phoneError").textContent = "";

    let hasError = false;

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();

    if (fullName === "") {
      document.getElementById("fullNameError").textContent =
        "Numele complet este obligatoriu.";
      hasError = true;
    }

    if (phone === "") {
      document.getElementById("phoneError").textContent =
        "Numărul de telefon este obligatoriu.";
      hasError = true;
    }

    if (!hasError) {
      // Gather all form data
      const formData = {
        fullName,
        phoneNumber: phone,
        deviceType: document.getElementById("deviceType").value,
        brandModel: document.getElementById("brandModel").value,
        problemDescription: document.getElementById("problemDescription").value,
        file: document.getElementById("fileUpload").value, // just the filename string, not file content
      };

      try {
        const response = await fetch("/api/sendRepairRequest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message); // success message from server
          this.reset(); // reset form if successful
        } else {
          alert("A apărut o eroare la trimiterea cererii.");
        }
      } catch (error) {
        console.error(error);
        alert("A apărut o eroare de rețea sau de server.");
      }
    }
  });
