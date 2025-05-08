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
        file: document.getElementById("file-upload").value, // just the filename string, not file content
        acceptContact: document.getElementById("acceptContact").checked,
        preferredContact: document.getElementById("preferredContact").value,
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
          window.location.href = "submitted.html";
          this.reset(); // reset form if successful
        } else {
          // Bootstrap 5 toast display
          const errorToast = new bootstrap.Toast(
            document.getElementById("errorToast")
          );
          errorToast.show();
        }
      } catch (error) {
        console.error(error);
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
      }
    }
  });

// Side buttons functionality

const formButtonContainer = document.querySelector(".form-button-container");
const whatsappButtonContainer = document.querySelector(
  ".whatsapp-button-container"
);

const mediaQuery = window.matchMedia("(min-width: 576px)");

function setupHoverEffects(enable) {
  if (enable) {
    formButtonContainer.addEventListener("mouseenter", showForm);
    formButtonContainer.addEventListener("mouseleave", hideForm);
    whatsappButtonContainer.addEventListener("mouseenter", showWhatsapp);
    whatsappButtonContainer.addEventListener("mouseleave", hideWhatsapp);
  } else {
    formButtonContainer.removeEventListener("mouseenter", showForm);
    formButtonContainer.removeEventListener("mouseleave", hideForm);
    whatsappButtonContainer.removeEventListener("mouseenter", showWhatsapp);
    whatsappButtonContainer.removeEventListener("mouseleave", hideWhatsapp);
  }
}

function showForm() {
  document.querySelector(".side-buttons-form").classList.remove("d-none");
}

function hideForm() {
  document.querySelector(".side-buttons-form").classList.add("d-none");
}

function showWhatsapp() {
  document.querySelector(".side-buttons-whatsapp").classList.remove("d-none");
}

function hideWhatsapp() {
  document.querySelector(".side-buttons-whatsapp").classList.add("d-none");
}

setupHoverEffects(mediaQuery.matches);

mediaQuery.addEventListener("change", (e) => {
  setupHoverEffects(e.matches);
});
