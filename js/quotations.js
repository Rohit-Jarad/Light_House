let quotations = [];
let quotationCustomers = [];
let quotationProducts = [];
let quoteItems = [];

function quotationsTemplate() {
  return `<div class="page-card p-3">
    <div class="d-flex justify-content-between mb-3"><button class="btn btn-primary" id="createQuotationBtn">Create Quotation</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody id="quotationTable"></tbody></table></div>
  </div>
  <div class="modal fade" id="quotationModal"><div class="modal-dialog modal-lg"><form class="modal-content" id="quotationForm"><div class="modal-header"><h5>Create Quotation</h5><button class="btn-close" data-bs-dismiss="modal" type="button"></button></div><div class="modal-body">
    <select class="form-select mb-2" id="customerId" required></select>
    <div class="border rounded p-2 mb-2">
      <div class="row g-2">
        <div class="col-md-5"><select class="form-select" id="quoteProductSelect"></select></div>
        <div class="col-md-3"><input class="form-control" id="quoteQty" type="number" min="1" value="1" /></div>
        <div class="col-md-2"><button type="button" class="btn btn-outline-primary w-100" id="addQuoteItemBtn">Add</button></div>
      </div>
      <table class="table table-sm mt-2 mb-0"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody id="quoteItemsTable"></tbody></table>
    </div>
    <input class="form-control mb-2" id="discount" type="number" min="0" placeholder="Discount" value="0" />
    <input class="form-control mb-2" id="gst" type="number" min="0" placeholder="GST" value="0" />
    <input class="form-control mb-2" id="subtotal" type="number" min="0" placeholder="Subtotal" readonly />
    <input class="form-control mb-2" id="total" type="number" min="0" placeholder="Total" readonly />
    <select class="form-select" id="status"><option>Draft</option><option>Sent</option><option>Approved</option></select>
  </div><div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save</button></div></form></div></div>`;
}

function renderQuotationTable() {
  const mapCust = Object.fromEntries(quotationCustomers.map((c) => [c.customerId, c.customerName]));
  quotationTable.innerHTML = quotations.map((q) => `<tr><td>${q.quotationId}</td><td>${mapCust[q.customerId] || "-"}</td><td>${q.quotationDate}</td><td>${q.total}</td><td>${q.status}</td><td>
    <button class="btn btn-sm btn-success" onclick='shareQuote("${q.quotationId}")'><i class="fa-brands fa-whatsapp me-1"></i>Share</button>
    <button class="btn btn-sm btn-secondary" onclick='downloadQuote("${q.quotationId}")'>PDF</button></td></tr>`).join("") || `<tr><td colspan="6" class="text-center">No quotations yet</td></tr>`;
}

function shareQuote(quotationId) {
  const q = quotations.find((x) => x.quotationId === quotationId);
  const c = quotationCustomers.find((x) => x.customerId === q.customerId);
  shareOnWhatsApp(c.phone, buildQuotationMessage(q));
}

function downloadQuote(quotationId) {
  const q = quotations.find((x) => x.quotationId === quotationId);
  exportTextToPdf(`${quotationId}.pdf`, [`Quotation: ${q.quotationId}`, `Date: ${q.quotationDate}`, `Total: ${q.total}`, `Status: ${q.status}`, "Jarad Machinery & Electrical"]);
}

function calculateQuoteTotals() {
  const subtotalValue = quoteItems.reduce((sum, it) => sum + Number(it.total || 0), 0);
  const discountValue = Number(document.getElementById("discount").value || 0);
  const gstValue = Number(document.getElementById("gst").value || 0);
  document.getElementById("subtotal").value = subtotalValue.toFixed(2);
  document.getElementById("total").value = Math.max(0, subtotalValue - discountValue + gstValue).toFixed(2);
}

function renderQuoteItems() {
  const host = document.getElementById("quoteItemsTable");
  host.innerHTML = quoteItems.map((it, idx) => `<tr><td>${it.productName}</td><td>${it.quantity}</td><td>${it.price}</td><td>${it.total}</td><td><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeQuoteItem(${idx})">x</button></td></tr>`).join("") || `<tr><td colspan="5" class="text-center text-muted">No items added</td></tr>`;
  calculateQuoteTotals();
}

function removeQuoteItem(index) {
  quoteItems.splice(index, 1);
  renderQuoteItems();
}

async function initQuotations() {
  renderLayout("quotations", t("quotations"), quotationsTemplate());
  showLoader(true);
  quotations = await fetchList("getQuotations");
  quotationCustomers = await fetchList("getCustomers");
  quotationProducts = await fetchList("getProducts");
  showLoader(false);
  customerId.innerHTML = quotationCustomers.map((c) => `<option value="${c.customerId}">${c.customerName}</option>`).join("");
  quoteProductSelect.innerHTML = quotationProducts.map((p) => `<option value="${p.productId}">${p.productName} - ${p.price}</option>`).join("");
  renderQuotationTable();
  createQuotationBtn.onclick = () => {
    quoteItems = [];
    quotationForm.reset();
    renderQuoteItems();
    new bootstrap.Modal(quotationModal).show();
  };
  addQuoteItemBtn.onclick = () => {
    const productId = quoteProductSelect.value;
    const product = quotationProducts.find((p) => p.productId === productId);
    if (!product) return;
    const quantity = Number(quoteQty.value || 1);
    const price = Number(product.price || 0);
    quoteItems.push({
      productId: product.productId,
      productName: product.productName,
      quantity,
      price,
      total: quantity * price
    });
    renderQuoteItems();
  };
  discount.oninput = calculateQuoteTotals;
  gst.oninput = calculateQuoteTotals;
  quotationForm.onsubmit = async (e) => {
    e.preventDefault();
    const subtotal = Number(document.getElementById("subtotal").value || 0);
    const discount = Number(document.getElementById("discount").value || 0);
    const gst = Number(document.getElementById("gst").value || 0);
    const total = Number(document.getElementById("total").value || 0);
    if (!quoteItems.length) return showToast("Add at least one product", "danger");
    const payload = { customerId: document.getElementById("customerId").value, subtotal, discount, gst, total, status: document.getElementById("status").value, items: quoteItems };
    await apiRequest("createQuotation", payload);
    bootstrap.Modal.getInstance(quotationModal).hide();
    showToast("Quotation created");
    await initQuotations();
  };
}
document.addEventListener("DOMContentLoaded", () => initQuotations().catch((e) => showToast(e.message, "danger")));
