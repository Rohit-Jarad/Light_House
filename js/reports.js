async function initReports() {
  renderLayout("reports", t("reports"), `
    <div class="page-card p-3 mb-3">
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" id="refreshReportsBtn">Refresh Reports</button>
        <button class="btn btn-success" id="exportCsvBtn">Export CSV</button>
        <button class="btn btn-warning" id="exportExcelBtn">Export Excel</button>
        <button class="btn btn-secondary" id="exportPdfBtn">Export PDF</button>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-md-4"><div class="page-card p-3"><h6>Daily Sales</h6><h4 id="dailyRevenue">-</h4></div></div>
      <div class="col-md-4"><div class="page-card p-3"><h6>Weekly Sales</h6><h4 id="weeklyRevenue">-</h4></div></div>
      <div class="col-md-4"><div class="page-card p-3"><h6>Yearly Sales</h6><h4 id="yearlyRevenue">-</h4></div></div>
    </div>
    <div class="page-card p-3 mt-3"><pre id="reportOutput" style="white-space:pre-wrap;"></pre></div>
  `);
  let reportData = await apiRequest("getReports");
  dailyRevenue.textContent = formatCurrency(reportData.data.dailyRevenue || 0);
  weeklyRevenue.textContent = formatCurrency(reportData.data.weeklyRevenue || 0);
  yearlyRevenue.textContent = formatCurrency(reportData.data.yearlyRevenue || 0);
  reportOutput.textContent = JSON.stringify(reportData.data, null, 2);

  refreshReportsBtn.onclick = async () => {
    reportData = await apiRequest("getReports");
    dailyRevenue.textContent = formatCurrency(reportData.data.dailyRevenue || 0);
    weeklyRevenue.textContent = formatCurrency(reportData.data.weeklyRevenue || 0);
    yearlyRevenue.textContent = formatCurrency(reportData.data.yearlyRevenue || 0);
    reportOutput.textContent = JSON.stringify(reportData.data, null, 2);
  };
  exportCsvBtn.onclick = () => exportTableToCSV("reports.csv", [["key", "value"], ...Object.entries(reportData.data).filter((x) => typeof x[1] !== "object")]);
  exportExcelBtn.onclick = () => exportJsonToExcel("reports.xlsx", [reportData.data]);
  exportPdfBtn.onclick = () => exportTextToPdf("reports.pdf", ["Jarad Reports", ...JSON.stringify(reportData.data, null, 2).split("\n").slice(0, 40)]);
}
document.addEventListener("DOMContentLoaded", () => initReports().catch((e) => showToast(e.message, "danger")));
