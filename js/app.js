function initLayout(activeKey) {
  const user = requireAuth();
  if (!user) return;
  applyTranslations();
  const userNameEl = document.getElementById("loggedUserName");
  if (userNameEl) userNameEl.textContent = `${user.name} (${user.role})`;
  document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === activeKey);
  });
}

function isAdmin() {
  const user = getSession();
  return user && user.role === "Admin";
}

function isSuperAdmin() {
  const user = getSession();
  return user && user.role === "Admin" && String(user.username || "").toLowerCase() === "admin";
}

function showLoader(show = true) {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.toggle("show", show);
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.setAttribute("role", "alert");
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(el);
  new bootstrap.Toast(el, { delay: 2600 }).show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function whatsappShare(phone, text) {
  const cleaned = String(phone).replace(/\D/g, "");
  const url = `https://wa.me/91${cleaned}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function paginateRows(data, page = 1, pageSize = 10) {
  const p = Math.max(1, page);
  const size = Math.max(1, pageSize);
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const start = (p - 1) * size;
  const items = data.slice(start, start + size);
  return { items, total, totalPages, page: Math.min(p, totalPages) };
}

function renderPager(targetId, page, totalPages, onChange) {
  const host = document.getElementById(targetId);
  if (!host) return;
  host.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mt-2">
      <small class="text-muted">Page ${page} of ${totalPages}</small>
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-primary" ${page <= 1 ? "disabled" : ""} data-page-jump="${page - 1}">Prev</button>
        <button class="btn btn-outline-primary" ${page >= totalPages ? "disabled" : ""} data-page-jump="${page + 1}">Next</button>
      </div>
    </div>
  `;
  host.querySelectorAll("[data-page-jump]").forEach((btn) => {
    btn.addEventListener("click", () => onChange(Number(btn.dataset.pageJump)));
  });
}

document.addEventListener("click", (e) => {
  const langBtn = e.target.closest("[data-lang]");
  if (!langBtn) return;
  setLang(langBtn.dataset.lang);
});
