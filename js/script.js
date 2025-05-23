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
      const fullNameError = form.querySelector("#fullNameError");
      const phoneError = form.querySelector("#phoneError");
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
    .querySelector(".repairForm")
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

        const submitText = document.getElementById("submitText");
        submitText.textContent = "Se trimite...";

        const form = document.querySelector(".repairForm");
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
          document.getElementById("acceptContact").checked ? "Da" : "Nu"
        );

        formData.append(
          "preferredContact",
          document.getElementById("acceptContact").checked
            ? document.getElementById("preferredContact").value
            : "Niciuna"
        );

        formData.append(
          "cf-turnstile-response",
          document.querySelector('input[name="cf-turnstile-response"]').value
        );

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
            sessionStorage.setItem("formSubmitted", "true");
          } else if (result.reason === "limit-reached") {
            sessionStorage.setItem("limitReached", "true");
            window.location.href = "/limit-reached.html";
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
          submitText.textContent = "Trimite cererea"; // Restore original text
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

if (formButtonContainer && whatsappButtonContainer) {
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
}

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
  if (navBar) {
    if (!navBar.contains(clicked)) {
      document.querySelector(".navbar-collapse").classList.remove("show");
      document.querySelector(".navbar-toggler").classList.add("collapsed");
      document
        .querySelector(".navbar-toggler")
        .setAttribute("aria-expanded", "false");
    }
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

// Cookies pop-up functionality

document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");

  // Show banner only if cookies haven't been accepted
  if (localStorage.getItem("cookiesAccepted") !== "true") {
    banner.classList.remove("d-none");
  }

  // Handle accept button
  acceptBtn.addEventListener("click", function () {
    localStorage.setItem("cookiesAccepted", "true");
    banner.classList.add("d-none");
  });
});

// Logic for the mobile action bar

document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggle-schedule");
  const scheduleBox = document.getElementById("schedule-box");
  const scheduleButtonText = document.querySelector(".schedule-button-text");

  toggleBtn.addEventListener("click", function () {
    if (scheduleBox.classList.contains("d-none")) {
      scheduleBox.classList.remove("d-none");
      scheduleButtonText.textContent = "Închide";
    } else {
      scheduleBox.classList.add("d-none");
      scheduleButtonText.textContent = "Vezi Program";
    }
  });
});

// read from the spreadsheet
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQMz33fovxyG1OWTyZdiSZ3Jk_VEb2_Dsaqgudr6VatdPZGmH31oMYQussk0B7FU5RmTdjWSOSxwPVl/pub?output=csv";

fetch(SHEET_CSV_URL)
  .then((response) => response.text())
  .then((csvText) => {
    const data = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    }).data;
    displayRepairPrices(data);
  });

function displayRepairPrices(data) {
  const grouped = {};

  // Group by 'Reparație' > 'Tip Dispozitiv'
  data.forEach((row) => {
    const repair = row["Reparație"];
    const deviceType = row["Tip Dispozitiv"];
    const model = row["Model"];
    const price = row["Preț"];

    if (!grouped[repair]) grouped[repair] = {};
    if (!grouped[repair][deviceType]) grouped[repair][deviceType] = [];

    grouped[repair][deviceType].push({ model, price });
  });

  const container = document.getElementById("repair-prices-container");
  if (container) {
    container.innerHTML = "";

    Object.entries(grouped).forEach(([repairType, deviceGroups]) => {
      const repairTitle = document.createElement("h5");
      repairTitle.textContent = repairType;
      repairTitle.classList.add("mt-4", "fw-bold");
      container.appendChild(repairTitle);

      Object.entries(deviceGroups).forEach(([deviceType, models]) => {
        const deviceTitle = document.createElement("h6");
        deviceTitle.textContent = deviceType;
        deviceTitle.classList.add("mt-3");
        container.appendChild(deviceTitle);

        // Sort models by price (optional)
        models.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        const table = document.createElement("table");
        table.className =
          "table table-sm table-bordered table-striped align-middle";
        table.style.tableLayout = "fixed";
        table.style.width = "100%";
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th>Model</th>
            <th>Preț (RON)</th>
          </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        models.forEach(({ model, price }) => {
          const row = document.createElement("tr");
          row.innerHTML = `<td>${model}</td><td>${price}</td>`;
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);
      });
    });
  }
}
