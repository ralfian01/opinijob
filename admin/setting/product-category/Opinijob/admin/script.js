document.addEventListener("DOMContentLoaded", () => {
  // --- Guard halaman: kalau belum login (tidak ada token), lempar ke login ---
  const token = sessionStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {
    window.location.href = "/login/index.html";
    return; // hentikan eksekusi sisa script, halaman akan segera redirect
  }

  // --- Tampilkan info user yang sedang login (kalau datanya ada) ---
  const userLabel = document.getElementById("adminUserLabel");
  if (userLabel) {
    const rawUser = sessionStorage.getItem("user");
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        userLabel.textContent = user.name || user.email || "Admin";
      } catch (err) {
        userLabel.textContent = "Admin";
      }
    }
  }

  // --- Timestamp sederhana untuk header dashboard ---
  const timestampEl = document.getElementById("dashboardTimestamp");
  if (timestampEl) {
    const now = new Date();
    timestampEl.textContent = `Diperbarui ${now.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })}`;
  }

  // --- Logout: bersihkan session lalu kembali ke halaman login ---
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login/index.html";
    });
  }
});
