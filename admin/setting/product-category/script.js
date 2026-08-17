document.addEventListener('DOMContentLoaded', function () {
    const categoryModal = document.getElementById("categoryModal");
    const openCategoryModal = document.getElementById("openCategoryModal");
    const closeCategoryModal = document.getElementById("closeCategoryModal");
    const cancelCategoryModal = document.getElementById("cancelCategoryModal");
    const categoryForm = document.getElementById("categoryForm");
    const categoryTableBody = document.getElementById("categoryTableBody");
    const categorySearchForm = document.getElementById("categorySearchForm");
    const categorySearchInput = document.getElementById("categorySearch");
    const resetCategorySearch = document.getElementById("resetCategorySearch");
    const paginationInfo = document.querySelector(".pagination p");
    const modalTitle = categoryModal ? categoryModal.querySelector(".modal__header h3") : null;
    const modalDesc = categoryModal ? categoryModal.querySelector(".modal__header p") : null;

    if (
        !(categoryModal instanceof HTMLElement)
        || !(openCategoryModal instanceof HTMLButtonElement)
        || !(closeCategoryModal instanceof HTMLButtonElement)
        || !(cancelCategoryModal instanceof HTMLButtonElement)
    ) {
        return;
    }

    // --- Data kategori disimpan di localStorage supaya tetap ada meski halaman di-reload ---
    const STORAGE_KEY = "opinijob_categories";

    const defaultCategories = [
        {
            id: "retail-store",
            name: "Retail Store",
            code: "retail-store",
            description: "Kategori untuk observasi dan survei toko retail.",
            product: "Riset Kuantitatif",
        },
        {
            id: "komunitas-online",
            name: "Komunitas Online",
            code: "komunitas-online",
            description: "Kategori untuk peserta berbasis komunitas digital.",
            product: "FGD Online",
        },
        {
            id: "audit-outlet",
            name: "Audit Outlet",
            code: "audit-outlet",
            description: "Kategori untuk kebutuhan audit toko dan pengecekan display.",
            product: "Audit Lapangan",
        },
    ];

    function getCategories() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : null;
        } catch (err) {
            console.warn("Gagal membaca data kategori:", err);
            return null;
        }
    }

    function saveCategories(categories) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }

    let categories = getCategories();
    if (categories === null) {
        categories = defaultCategories;
        saveCategories(categories);
    }

    let editingId = null; // id kategori yang sedang diubah, null = mode tambah baru

    function slugify(text) {
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function renderRow(category) {
        const searchText = [category.name, category.code, category.description, category.product]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return `
            <tr data-search="${escapeHtml(searchText)}" data-id="${escapeHtml(category.id)}">
                <td>${escapeHtml(category.name)}</td>
                <td><span class="badge">${escapeHtml(category.code)}</span></td>
                <td>${escapeHtml(category.description) || "-"}</td>
                <td class="table-center">${category.product ? `<span class="chip">${escapeHtml(category.product)}</span>` : "-"}</td>
                <td class="table-right">
                    <button type="button" class="icon-button" data-edit-category>Ubah</button>
                    <button type="button" class="icon-button icon-button--danger" data-delete-category>Hapus</button>
                </td>
            </tr>
        `;
    }

    function loadCategories() {
        if (!categoryTableBody) return;

        if (categories.length === 0) {
            categoryTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color: var(--muted);">Belum ada kategori. Klik "Tambah Kategori" untuk menambahkan.</td>
                </tr>
            `;
        } else {
            categoryTableBody.innerHTML = categories.map(renderRow).join("");
        }

        if (paginationInfo) {
            paginationInfo.textContent = `Menampilkan ${categories.length} dari ${categories.length} kategori`;
        }

        // Terapkan ulang filter pencarian yang sedang aktif (kalau ada)
        if (categorySearchInput && categorySearchInput.value.trim() !== "") {
            filterCategories(categorySearchInput.value);
        }
    }

    function filterCategories(keyword) {
        const term = keyword.trim().toLowerCase();
        const rows = categoryTableBody.querySelectorAll("tr[data-search]");
        let visibleCount = 0;

        rows.forEach((row) => {
            const matches = row.dataset.search.includes(term);
            row.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        if (paginationInfo) {
            paginationInfo.textContent = term === ""
                ? `Menampilkan ${categories.length} dari ${categories.length} kategori`
                : `Menampilkan ${visibleCount} dari ${categories.length} kategori`;
        }
    }

    function resetForm() {
        categoryForm.reset();
        editingId = null;
        if (modalTitle) modalTitle.textContent = "Tambah Kategori";
        if (modalDesc) modalDesc.textContent = "Isi formulir untuk menambahkan kategori baru.";
    }

    function toggleCategoryModal(show) {
        categoryModal.hidden = !show;
        if (!show) {
            resetForm();
        }
    }

    openCategoryModal.addEventListener("click", () => {
        resetForm();
        toggleCategoryModal(true);
    });

    closeCategoryModal.addEventListener("click", () => {
        toggleCategoryModal(false);
    });

    cancelCategoryModal.addEventListener("click", () => {
        toggleCategoryModal(false);
    });

    // Klik di luar dialog akan menutup modal juga
    categoryModal.addEventListener("click", (event) => {
        if (event.target === categoryModal) {
            toggleCategoryModal(false);
        }
    });

    // --- Simpan Perubahan: tambah kategori baru atau update kategori yang sedang diubah ---
    if (categoryForm) {
        categoryForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const nameInput = document.getElementById("categoryName");
            const codeInput = document.getElementById("categoryCode");
            const descriptionInput = document.getElementById("categoryDescription");
            const productInput = document.getElementById("categoryProduct");

            const name = nameInput.value.trim();
            const code = slugify(codeInput.value.trim() || name);

            if (!name || !code) {
                alert("Nama kategori dan slug wajib diisi.");
                return;
            }

            // Cegah slug ganda (kecuali untuk kategori yang sedang diubah)
            const duplicate = categories.some((cat) => cat.code === code && cat.id !== editingId);
            if (duplicate) {
                alert("Slug kategori sudah dipakai, gunakan slug lain.");
                return;
            }

            const categoryData = {
                id: editingId || `${code}-${Date.now()}`,
                name,
                code,
                description: descriptionInput.value.trim(),
                product: productInput.value,
            };

            if (editingId) {
                categories = categories.map((cat) => (cat.id === editingId ? categoryData : cat));
            } else {
                categories.push(categoryData);
            }

            saveCategories(categories);
            loadCategories();
            toggleCategoryModal(false);
        });
    }

    // --- Ubah & Hapus kategori (event delegation di tbody) ---
    if (categoryTableBody) {
        categoryTableBody.addEventListener("click", (event) => {
            const editBtn = event.target.closest("[data-edit-category]");
            const deleteBtn = event.target.closest("[data-delete-category]");

            if (editBtn) {
                const row = editBtn.closest("tr");
                const id = row ? row.dataset.id : null;
                const category = categories.find((cat) => cat.id === id);
                if (!category) return;

                editingId = category.id;
                document.getElementById("categoryName").value = category.name;
                document.getElementById("categoryCode").value = category.code;
                document.getElementById("categoryDescription").value = category.description || "";
                document.getElementById("categoryProduct").value = category.product || "";

                if (modalTitle) modalTitle.textContent = "Ubah Kategori";
                if (modalDesc) modalDesc.textContent = "Perbarui detail kategori yang sudah ada.";

                toggleCategoryModal(true);
            }

            if (deleteBtn) {
                const row = deleteBtn.closest("tr");
                const id = row ? row.dataset.id : null;
                const category = categories.find((cat) => cat.id === id);
                if (!category) return;

                const confirmed = confirm(`Hapus kategori "${category.name}"?`);
                if (!confirmed) return;

                categories = categories.filter((cat) => cat.id !== id);
                saveCategories(categories);
                loadCategories();
            }
        });
    }

    // --- Pencarian kategori ---
    if (categorySearchForm) {
        categorySearchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            filterCategories(categorySearchInput.value);
        });
    }

    if (resetCategorySearch) {
        resetCategorySearch.addEventListener("click", () => {
            categorySearchInput.value = "";
            filterCategories("");
        });
    }

    loadCategories();
});
