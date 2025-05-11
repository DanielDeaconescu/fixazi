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

const repairModals = document.querySelectorAll("#formModal");

repairModals.forEach((modal) => {
  modal.addEventListener("hidden.bs.modal", function () {
    const form = modal.querySelector(".repairForm");

    if (form) {
      form.reset();

      // Clear file input manually
      const fileInput = form.querySelector(".file-upload");
      if (fileInput) {
        fileInput.value = "";
      }

      // Reset custom file name display
      const fileNameSpan = form.querySelector(".file-name");
      if (fileNameSpan) {
        fileNameSpan.textContent = "Niciun fișier selectat";
      }

      // Clear error messages inside this modal form only
      const fullNameError = form.querySelector(".fullNameError");
      const phoneError = form.querySelector(".phoneError");
      if (fullNameError) fullNameError.textContent = "";
      if (phoneError) phoneError.textContent = "";
    }
  });
});

// form validation
// form validation and submission
if (document.getElementById("repairForm")) {
  document
    .getElementById("repairForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

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

      // ✅ Only proceed if there are no validation errors
      if (!hasError) {
        const form = document.getElementById("repairForm");
        const fileInput = document.querySelector(".file-upload");
        const file = fileInput.files[0];

        // ✅ Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
          "image/gif",
        ];
        if (file && !allowedTypes.includes(file.type)) {
          alert(
            "Doar fișiere imagine sunt permise: JPEG, PNG, WEBP, JPG, GIF."
          );
          return;
        }

        const formData = new FormData();
        formData.append(
          "fullName",
          document.getElementById("fullName").value.trim()
        );
        formData.append(
          "phoneNumber",
          document.getElementById("phoneNumber").value.trim()
        );
        formData.append(
          "deviceType",
          document.getElementById("deviceType").value
        );
        formData.append(
          "brandModel",
          document.getElementById("brandModel").value
        );
        formData.append(
          "problemDescription",
          document.getElementById("problemDescription").value
        );
        formData.append(
          "acceptContact",
          document.getElementById("acceptContact").checked
        );
        formData.append(
          "preferredContact",
          document.getElementById("preferredContact").value
        );

        if (file) {
          formData.append("file", file);
        }

        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        try {
          const response = await fetch("/api/sendRepairRequest", {
            method: "POST",
            body: formData,
          });

          const result = await response.json(); // Parse JSON response

          if (result.success) {
            // ✅ Check the success flag from backend
            form.reset();
          } else {
            // Show error toast if success=false
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
}

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

// custom file upload functionality
document.querySelectorAll(".custom-file-upload").forEach((container) => {
  const input = container.querySelector(".file-upload");
  const label = container.querySelector(".custom-file-label");
  const fileNameSpan = container.querySelector(".file-name");

  // Clicking the label opens the file input
  label.addEventListener("click", () => input.click());

  // When file is selected, show its name
  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      fileNameSpan.textContent = input.files[0].name;
    } else {
      fileNameSpan.textContent = "Niciun fișier selectat";
    }
  });
});
