let payments = [];

function paymentsTemplate() {
  return `<div class="page-card p-3">
    <div class="d-flex justify-content-between mb-3"><h5 class="mb-0">Payments</h5><button class="btn btn-success btn-sm" id="exportExcelBtn"><i class="fa-solid fa-file-excel me-1"></i>Excel</button></div>
    <form id="paymentForm" class="row g-2 mb-3">
      <div class="col-md-3"><input id="billId" class="form-control" placeholder="Bill ID" required></div>
      <div class="col-md-2"><input id="amount" class="form-control" type="number" min="0" placeholder="Amount" required></div>
      <div class="col-md-3"><select id="paymentMethod" class="form-select"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option></select></div>
      <div class="col-md-2"><select id="status" class="form-select"><option>Paid</option><option>Pending</option></select></div>
      <div class="col-md-2"><button class="btn btn-primary w-100">Add</button></div>
    </form>
    <div class="table-responsive"><table class="table"><thead><tr><th>Payment ID</th><th>Bill</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>WhatsApp</th></tr></thead><tbody id="paymentsTable"></tbody></table></div>
  </div>`;
}

function renderPayments() {
  paymentsTable.innerHTML = payments.map((p) => `<tr><td>${p.paymentId}</td><td>${p.billId}</td><td>${p.amount}</td><td>${p.paymentMethod}</td><td>${p.paymentDate}</td><td>${p.status}</td><td><button class="btn btn-sm btn-success" onclick='sharePayment("${p.paymentId}")'>Remind</button></td></tr>`).join("") || `<tr><td colspan="7" class="text-center">No payment records</td></tr>`;
}

function sharePayment(paymentId) {
  const p = payments.find((x) => x.paymentId === paymentId);
  shareOnWhatsApp("9922556171", buildPaymentReminderMessage(p));
}

async function initPayments() {
  renderLayout("payments", t("payments"), paymentsTemplate());
  payments = await fetchList("getPayments");
  renderPayments();
  exportExcelBtn.onclick = () => exportJsonToExcel("payments.xlsx", payments);
  paymentForm.onsubmit = async (e) => {
    e.preventDefault();
    await apiRequest("addPayment", { billId: billId.value.trim(), amount: Number(amount.value || 0), paymentMethod: paymentMethod.value, status: status.value });
    showToast("Payment added");
    await initPayments();
  };
}
document.addEventListener("DOMContentLoaded", () => initPayments().catch((e) => showToast(e.message, "danger")));
