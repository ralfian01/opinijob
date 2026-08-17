document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://js-online-course-opinijob-production.up.railway.app";

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const alertBox = document.querySelector(".auth-alert");
  const submitBtn = form.querySelector("button[type='submit']");

  function setError(hasError, message) {
    emailInput.classList.toggle("input-error", hasError);
    passwordInput.classList.toggle("input-error", hasError);
    if (message) {
      alertBox.textContent = message;
    }
    alertBox.hidden = !hasError;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    setError(false);
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Memproses...";

    try {
      const response = await fetch(`${API_BASE}/api/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      // Simpan data login (token/user) supaya bisa dipakai di halaman lain.
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      alert("Login berhasil!");
      window.location.href = "/dashboard/index.html";
    } catch (err) {
      setError(true, err.message || "Username atau password salah.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  // Hilangkan warna merah begitu user mulai mengetik ulang
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => setError(false));
  });

  // Tombol "Tampilkan" untuk show/hide password
  const toggleBtn = document.querySelector("[data-toggle-password]");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const target = document.querySelector(toggleBtn.dataset.togglePassword);
      const isPassword = target.type === "password";
      target.type = isPassword ? "text" : "password";
      toggleBtn.textContent = isPassword ? "Sembunyikan" : "Tampilkan";
    });
  }
});