let bills = [];
let billCustomers = [];
let billProducts = [];
let billItems = [];

function billingTemplate() {
  return `<div class="page-card p-3">
    <div class="d-flex justify-content-between mb-3"><button class="btn btn-primary" id="createBillBtn">Create Invoice</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Actions</th></tr></thead><tbody id="billTable"></tbody></table></div>
  </div>
  <div class="modal fade" id="billModal"><div class="modal-dialog modal-lg"><form class="modal-content" id="billForm"><div class="modal-header"><h5>Create Invoice</h5><button class="btn-close" data-bs-dismiss="modal" type="button"></button></div><div class="modal-body">
    <select class="form-select mb-2" id="customerId" required></select>
    <div class="border rounded p-2 mb-2">
      <div class="row g-2">
        <div class="col-md-5"><select class="form-select" id="billProductSelect"></select></div>
        <div class="col-md-3"><input class="form-control" id="billQty" type="number" min="1" value="1" /></div>
        <div class="col-md-2"><button type="button" class="btn btn-outline-primary w-100" id="addBillItemBtn">Add</button></div>
      </div>
      <table class="table table-sm mt-2 mb-0"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody id="billItemsTable"></tbody></table>
    </div>
    <input class="form-control mb-2" id="gst" type="number" min="0" placeholder="GST" value="0" />
    <input class="form-control mb-2" id="subtotal" type="number" min="0" placeholder="Subtotal" readonly />
    <input class="form-control mb-2" id="total" type="number" min="0" placeholder="Total" readonly />
    <select class="form-select" id="paymentStatus"><option>Pending</option><option>Paid</option></select>
  </div><div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save</button></div></form></div></div>`;
}

function renderBillTable() {
  const mapCust = Object.fromEntries(billCustomers.map((c) => [c.customerId, c.customerName]));
  billTable.innerHTML = bills.map((b) => `<tr><td>${b.billId}</td><td>${mapCust[b.customerId] || "-"}</td><td>${b.billDate}</td><td>${b.total}</td><td>${b.paymentStatus}</td><td>
    <button class="btn btn-sm btn-success" onclick='shareBill("${b.billId}")'><i class="fa-brands fa-whatsapp me-1"></i>Share</button>
    <button class="btn btn-sm btn-secondary" onclick='downloadBill("${b.billId}")'>PDF</button></td></tr>`).join("") || `<tr><td colspan="6" class="text-center">No bills yet</td></tr>`;
}

function shareBill(billId) {
  const b = bills.find((x) => x.billId === billId);
  const c = billCustomers.find((x) => x.customerId === b.customerId);
  shareOnWhatsApp(c.phone, buildInvoiceMessage(b));
}

function downloadBill(billId) {
  const b = bills.find((x) => x.billId === billId);
  exportTextToPdf(`${billId}.pdf`, [`Invoice: ${b.billId}`, `Date: ${b.billDate}`, `Total: ${b.total}`, `Payment: ${b.paymentStatus}`]);
}

function calculateBillTotals() {
  const subtotalValue = billItems.reduce((sum, it) => sum + Number(it.total || 0), 0);
  const gstValue = Number(document.getElementById("gst").value || 0);
  document.getElementById("subtotal").value = subtotalValue.toFixed(2);
  document.getElementById("total").value = (subtotalValue + gstValue).toFixed(2);
}

function renderBillItems() {
  const host = document.getElementById("billItemsTable");
  host.innerHTML = billItems.map((it, idx) => `<tr><td>${it.productName}</td><td>${it.quantity}</td><td>${it.price}</td><td>${it.total}</td><td><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeBillItem(${idx})">x</button></td></tr>`).join("") || `<tr><td colspan="5" class="text-center text-muted">No items added</td></tr>`;
  calculateBillTotals();
}

function removeBillItem(index) {
  billItems.splice(index, 1);
  renderBillItems();
}

async function initBilling() {
  renderLayout("billing", t("billing"), billingTemplate());
  showLoader(true);
  bills = await fetchList("getBills");
  billCustomers = await fetchList("getCustomers");
  billProducts = await fetchList("getProducts");
  showLoader(false);
  customerId.innerHTML = billCustomers.map((c) => `<option value="${c.customerId}">${c.customerName}</option>`).join("");
  billProductSelect.innerHTML = billProducts.map((p) => `<option value="${p.productId}">${p.productName} - ${p.price}</option>`).join("");
  renderBillTable();
  createBillBtn.onclick = () => {
    billItems = [];
    billForm.reset();
    renderBillItems();
    new bootstrap.Modal(billModal).show();
  };
  addBillItemBtn.onclick = () => {
    const productId = billProductSelect.value;
    const product = billProducts.find((p) => p.productId === productId);
    if (!product) return;
    const quantity = Number(billQty.value || 1);
    const price = Number(product.price || 0);
    billItems.push({
      productId: product.productId,
      productName: product.productName,
      quantity,
      price,
      total: quantity * price
    });
    renderBillItems();
  };
  gst.oninput = calculateBillTotals;
  billForm.onsubmit = async (e) => {
    e.preventDefault();
    const subtotal = Number(document.getElementById("subtotal").value || 0);
    const gst = Number(document.getElementById("gst").value || 0);
    const total = Number(document.getElementById("total").value || 0);
    if (!billItems.length) return showToast("Add at least one product", "danger");
    const payload = { customerId: document.getElementById("customerId").value, subtotal, gst, total, paymentStatus: document.getElementById("paymentStatus").value, items: billItems };
    await apiRequest("createBill", payload);
    bootstrap.Modal.getInstance(billModal).hide();
    showToast("Invoice created");
    await initBilling();
  };
}
document.addEventListener("DOMContentLoaded", () => initBilling().catch((e) => showToast(e.message, "danger")));
