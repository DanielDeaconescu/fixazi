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

      // Make the last field invisible again
      const preferredContactGroup = form.querySelector(
        "#preferredContactGroup"
      );
      if (preferredContactGroup) {
        preferredContactGroup.classList.remove("expanded");
        preferredContactGroup.classList.add("collapsed");
      }

      // Uncheck the accept contact box
      const acceptContactCheckbox = form.querySelector("#acceptContact");
      if (acceptContactCheckbox) {
        acceptContactCheckbox.checked = false;
      }
    }
  });
});

// form validation and submission
if (document.querySelector(".repairForm")) {
  document
    .getElementById("repairForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent the default form submission

      // Get references to the button and spinner
      const submitButton = document.getElementById("submitBtn");
      const loadingSpinner = document.getElementById("loadingSpinner");

      console.log("Form submitted, showing spinner"); // Debug

      // Clear previous error messages
      document.getElementById("fullNameError").textContent = "";
      document.getElementById("phoneError").textContent = "";
      document.getElementById("fileError").textContent = ""; // Clear file error

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

      const fileInput = document.querySelector(".file-upload");
      const file = fileInput.files[0];

      // Validate file size
      if (file && file.size === 0) {
        document.getElementById("fileError").textContent =
          "Fișierul selectat nu este valid. Vă rugăm să alegeți un fișier valid.";
        hasError = true;
      }

      // ✅ Only proceed if there are no validation errors
      if (!hasError) {
        // Show the spinner and disable the button
        submitButton.disabled = true;
        loadingSpinner.style.display = "inline-block"; // Show spinner
        console.log("Spinner should be visible now"); // Debug

        const originalText = submitButton.textContent; // Save the original text
        submitButton.textContent = "Procesare..."; // Change the button text

        const form = document.getElementById("repairForm");
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("phoneNumber", phone);
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

        if (document.getElementById("acceptContact").checked) {
          formData.append(
            "preferredContact",
            document.getElementById("preferredContact").value
          );
        }

        if (file) {
          formData.append("file", file);
        }

        try {
          const response = await fetch("/api/sendRepairRequest", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            form.reset(); // Reset the form if successful
            window.location.href = "/submitted.html"; // Redirect after success
          } else {
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
        } finally {
          // Always re-enable the button and hide the spinner
          submitButton.disabled = false;
          loadingSpinner.style.display = "none"; // Hide spinner
          submitButton.textContent = originalText; // Restore original text
          console.log("Spinner hidden, button re-enabled"); // Debug
        }
      }
    });
}

document
  .getElementById("acceptContact")
  .addEventListener("change", function () {
    const preferredContactGroup = document.getElementById(
      "preferredContactGroup"
    );

    if (this.checked) {
      preferredContactGroup.classList.add("expanded");
      preferredContactGroup.classList.remove("collapsed");
    } else {
      preferredContactGroup.classList.remove("expanded");
      preferredContactGroup.classList.add("collapsed");
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

// clicking outside of the navigation closes the navigation
document.addEventListener("click", function (e) {
  const clicked = e.target;

  const navBar = document.querySelector(".navbar-custom");
  if (!navBar.contains(clicked)) {
    document.querySelector(".navbar-collapse").classList.remove("show");
    document.querySelector(".navbar-toggler").classList.add("collapsed");
    document
      .querySelector(".navbar-toggler")
      .setAttribute("aria-expanded", "false");
  }
});

// Copy the address to clipboard

const copyButton = document.querySelector(".copy-button");
if (copyButton) {
  copyButton.addEventListener("click", function () {
    const address = document.getElementById("address").textContent;

    navigator.clipboard
      .writeText(address)
      .then(() => {
        const toastEl = document.getElementById("copyToast");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      })
      .catch((err) => {
        console.error("Eroare la copierea adresei!", err);
      });
  });
}
