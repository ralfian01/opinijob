document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitRegister");
  const toggleBtn = document.querySelector("[data-toggle-password]");
  const formAlert = document.getElementById("formAlert");
  const minLengthRule = document.querySelector('[data-rule="minLength"]');

  const nameError = document.querySelector('[data-error-for="name"]');
  const emailError = document.querySelector('[data-error-for="email"]');
  const passwordError = document.querySelector('[data-error-for="password"]');

  function validateForm() {
    const isNameValid = nameInput.value.trim().length > 0;
    const isEmailValid = emailInput.value.includes("@");
    const isPasswordValid = passwordInput.value.length >= 8;

    nameError.textContent = isNameValid || nameInput.value === "" ? "" : "Nama tidak boleh kosong.";
    emailError.textContent = isEmailValid || emailInput.value === "" ? "" : "Format email tidak valid.";
    passwordError.textContent = isPasswordValid || passwordInput.value === "" ? "" : "Password minimal 8 karakter.";

    if (minLengthRule) {
      minLengthRule.classList.toggle("is-valid", isPasswordValid);
    }

    const isFormValid = isNameValid && isEmailValid && isPasswordValid;
    submitBtn.disabled = !isFormValid;
    return isFormValid;
  }

  nameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  passwordInput.addEventListener("input", validateForm);

  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "Sembunyikan" : "Tampilkan";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    formAlert.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Memproses...";

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };

    try {
      const response = await fetch("https://js-online-course-opinijob-production.up.railway.app/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Registrasi gagal");
      }

      const data = await response.json();

      formAlert.hidden = false;
      formAlert.classList.add("is-success");
      formAlert.textContent = "Pendaftaran berhasil! Mengalihkan...";

      setTimeout(() => {
        window.location.href = "/login/index.html";
      }, 1500);
    } catch (err) {
      formAlert.hidden = false;
      formAlert.classList.remove("is-success");
      formAlert.textContent = "Pendaftaran gagal. Silakan periksa kembali data Anda.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Daftar";
    }
  });

  validateForm();
});
