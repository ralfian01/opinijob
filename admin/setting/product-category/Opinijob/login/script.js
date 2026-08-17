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

      // Debug: lihat isi response asli di Console (F12) untuk cek nama field yang benar.
      console.log("Response login:", data);

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      // Coba tebak lokasi token & user dari beberapa pola response yang umum dipakai:
      // { token, user }  |  { data: { token, user } }  |  { accessToken, ... }  |  dst.
      const container = data.data && typeof data.data === "object" ? data.data : data;
      const token =
        container.token ||
        container.accessToken ||
        container.access_token ||
        container.jwt ||
        null;
      const user = container.user || container.account || container.data || null;

      if (!token) {
        console.warn(
          "Tidak menemukan field token di response login. Cek Console untuk bentuk response aslinya."
        );
      }

      // Simpan data login (token/user) di sessionStorage untuk dipakai di halaman admin.
      if (token) {
        sessionStorage.setItem("token", token);
      }
      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      alert("Login berhasil!");
      window.location.href = "/admin/index.html";
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