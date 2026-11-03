const form = document.querySelector("#ticket-form");
const avatarInput = document.querySelector("#avatar");
const uploadArea = document.querySelector("#upload-area");
const uploadContent = document.querySelector("#upload-content");
const avatarError = document.querySelector("#avatar-error");
const successView = document.querySelector("#success-view");
const formView = document.querySelector("#form-view");
const maxAvatarSize = 500 * 1024;
let avatarUrl = "";

const fields = {
  fullName: {
    input: document.querySelector("#full-name"),
    error: document.querySelector("#name-error"),
    validate(value) {
      return value.trim() ? "" : "Por favor, informe seu nome completo.";
    },
  },
  email: {
    input: document.querySelector("#email"),
    error: document.querySelector("#email-error"),
    validate(value) {
      if (!value.trim()) return "Por favor, informe seu endereço de e-mail.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ""
        : "Digite um endereço de e-mail válido.";
    },
  },
  github: {
    input: document.querySelector("#github"),
    error: document.querySelector("#github-error"),
    validate(value) {
      return value.trim() ? "" : "Por favor, informe seu nome de usuário do GitHub.";
    },
  },
};

function showFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function showAvatarError(message) {
  avatarError.textContent = message;
  if (message) {
    avatarInput.setAttribute("aria-invalid", "true");
  } else {
    avatarInput.removeAttribute("aria-invalid");
  }
}

function validateAvatar() {
  const file = avatarInput.files[0];
  if (!file) {
    showAvatarError("Por favor, envie uma imagem para seu avatar.");
    return false;
  }
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    showAvatarError("Formato inválido. Escolha uma imagem PNG ou JPG.");
    return false;
  }
  if (file.size > maxAvatarSize) {
    showAvatarError("A imagem deve ter no máximo 500KB.");
    return false;
  }
  showAvatarError("");
  return true;
}

function displayAvatar(file) {
  if (avatarUrl) URL.revokeObjectURL(avatarUrl);
  avatarUrl = URL.createObjectURL(file);
  uploadArea.classList.add("has-avatar");
  uploadContent.innerHTML = "";

  const preview = document.createElement("img");
  preview.className = "avatar-preview";
  preview.src = avatarUrl;
  preview.alt = "";

  const copy = document.createElement("span");
  copy.className = "upload-copy";
  copy.textContent = "Clique para alterar a imagem";

  uploadContent.append(preview, copy);
}

function resetAvatarPreview() {
  if (avatarUrl) URL.revokeObjectURL(avatarUrl);
  avatarUrl = "";
  uploadArea.classList.remove("has-avatar");
  uploadContent.innerHTML = `<span class="upload-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </span><span class="upload-copy">Arraste e solte ou <span>escolha uma imagem</span></span>`;
}

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  if (validateAvatar()) {
    displayAvatar(file);
  } else {
    avatarInput.value = "";
    resetAvatarPreview();
  }
});

for (const field of Object.values(fields)) {
  field.input.addEventListener("blur", () => {
    showFieldError(field.input, field.error, field.validate(field.input.value));
  });
  field.input.addEventListener("input", () => {
    if (field.input.hasAttribute("aria-invalid")) {
      showFieldError(field.input, field.error, field.validate(field.input.value));
    }
  });
}

uploadArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadArea.classList.add("is-dragging");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("is-dragging");
});

uploadArea.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadArea.classList.remove("is-dragging");
  const [file] = event.dataTransfer.files;
  if (!file) return;

  const transfer = new DataTransfer();
  transfer.items.add(file);
  avatarInput.files = transfer.files;
  if (validateAvatar()) {
    displayAvatar(file);
  } else {
    avatarInput.value = "";
    resetAvatarPreview();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let firstInvalidField = null;
  let valid = validateAvatar();

  for (const field of Object.values(fields)) {
    const message = field.validate(field.input.value);
    showFieldError(field.input, field.error, message);
    if (message) {
      valid = false;
      firstInvalidField ||= field.input;
    }
  }

  if (!valid) {
    if (firstInvalidField) firstInvalidField.focus();
    else avatarInput.focus();
    return;
  }

  const data = new FormData(form);
  document.querySelector("#success-name").textContent = data.get("fullName").trim();
  document.querySelector("#success-email").textContent = data.get("email").trim();
  document.querySelector("#ticket-name").textContent = data.get("fullName").trim();
  document.querySelector("#ticket-github").textContent = data.get("github").trim().replace(/^@/, "");
  const ticketAvatar = document.querySelector("#ticket-avatar");
  ticketAvatar.src = avatarUrl;
  ticketAvatar.alt = `Avatar de ${data.get("fullName").trim()}`;

  formView.hidden = true;
  successView.hidden = false;
  document.querySelector("#success-title").focus();
});

document.querySelector("#success-title").tabIndex = -1;

document.querySelector("#reset-button").addEventListener("click", () => {
  form.reset();
  for (const field of Object.values(fields)) {
    showFieldError(field.input, field.error, "");
  }
  showAvatarError("");
  resetAvatarPreview();
  successView.hidden = true;
  formView.hidden = false;
  document.querySelector("#full-name").focus();
});
