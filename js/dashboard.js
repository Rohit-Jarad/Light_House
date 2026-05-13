async function loadDashboard() {
  initLayout("dashboard");
  const user = getSession();
  if (user && user.role !== "Admin") {
    const settingsLink = document.querySelector('.nav-link[data-page="settings"]');
    if (settingsLink) settingsLink.remove();
  }
  if (isSuperAdmin() && !document.querySelector('.nav-link[data-page="users"]')) {
    const reportsLink = document.querySelector('.nav-link[data-page="reports"]');
    if (reportsLink) {
      reportsLink.insertAdjacentHTML("afterend", `<a href="users.html" class="nav-link" data-page="users">Client Access</a>`);
    }
  }
  showLoader(true);
  try {
    const report = await apiRequest("getReports");
    const d = report.data;
    const cards = [
      ["Total Products", d.totalProducts],
      ["Total Customers", d.totalCustomers],
      ["Total Vendors", d.totalVendors],
      ["Total Quotations", d.totalQuotations],
      ["Total Bills", d.totalBills],
      ["Monthly Revenue", formatCurrency(d.monthlyRevenue)],
      ["Pending Payments", formatCurrency(d.pendingPayments)],
      ["Today Revenue", formatCurrency(d.dailyRevenue || 0)],
      ["Weekly Revenue", formatCurrency(d.weeklyRevenue || 0)],
      ["Yearly Revenue", formatCurrency(d.yearlyRevenue || 0)]
    ];
    document.getElementById("kpiCards").innerHTML = cards.map((c) => `
      <div class="col-sm-6 col-lg-3"><div class="page-card kpi-card p-3"><h6>${c[0]}</h6><h4>${c[1]}</h4></div></div>
    `).join("");

    new Chart(document.getElementById("monthlySalesChart"), {
      type: "line",
      data: { labels: d.monthlySales.map((x) => x.month), datasets: [{ label: "Sales", data: d.monthlySales.map((x) => x.total), borderColor: "#0b1f4d" }] }
    });
    new Chart(document.getElementById("productSalesChart"), {
      type: "bar",
      data: { labels: d.productSales.map((x) => x.name), datasets: [{ label: "Qty", data: d.productSales.map((x) => x.qty), backgroundColor: "#ffd200" }] }
    });
  } catch (err) {
    showToast(err.message, "danger");
  } finally {
    showLoader(false);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
