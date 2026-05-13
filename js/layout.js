function renderLayout(pageKey, title, contentHtml) {
  const user = requireAuth();
  if (!user) return;
  const showSettings = user.role === "Admin";
  const showUserAccess = isSuperAdmin();
  const html = `
    <div class="d-lg-flex app-shell">
      <aside class="sidebar p-2">
        <div class="brand">${t("appName")}</div>
        <nav class="nav flex-column mt-3">
          <a href="dashboard.html" class="nav-link ${pageKey === "dashboard" ? "active" : ""}" data-page="dashboard">${t("dashboard")}</a>
          <a href="products.html" class="nav-link ${pageKey === "products" ? "active" : ""}" data-page="products">${t("products")}</a>
          <a href="vendors.html" class="nav-link ${pageKey === "vendors" ? "active" : ""}" data-page="vendors">${t("vendors")}</a>
          <a href="customers.html" class="nav-link ${pageKey === "customers" ? "active" : ""}" data-page="customers">${t("customers")}</a>
          <a href="quotations.html" class="nav-link ${pageKey === "quotations" ? "active" : ""}" data-page="quotations">${t("quotations")}</a>
          <a href="billing.html" class="nav-link ${pageKey === "billing" ? "active" : ""}" data-page="billing">${t("billing")}</a>
          <a href="payments.html" class="nav-link ${pageKey === "payments" ? "active" : ""}" data-page="payments">${t("payments")}</a>
          <a href="reports.html" class="nav-link ${pageKey === "reports" ? "active" : ""}" data-page="reports">${t("reports")}</a>
          ${showSettings ? `<a href="settings.html" class="nav-link ${pageKey === "settings" ? "active" : ""}" data-page="settings">${t("settings")}</a>` : ""}
          ${showUserAccess ? `<a href="users.html" class="nav-link ${pageKey === "users" ? "active" : ""}" data-page="users">Client Access</a>` : ""}
          <button class="btn btn-outline-light btn-sm m-2" data-logout>${t("logout")}</button>
        </nav>
      </aside>
      <main class="main-content flex-grow-1">
        <div class="topbar p-3 d-flex justify-content-between align-items-center">
          <h4 class="mb-0 page-title">${title}</h4>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-primary lang-btn" data-lang="en">English</button>
            <button class="btn btn-sm btn-outline-primary lang-btn" data-lang="mr">मराठी</button>
            <span id="loggedUserName" class="badge text-bg-secondary">${user.name} (${user.role})</span>
          </div>
        </div>
        <div class="container-fluid p-3">${contentHtml}</div>
      </main>
    </div>`;
  document.getElementById("appContainer").innerHTML = html;
}
