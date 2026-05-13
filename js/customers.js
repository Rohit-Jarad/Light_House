let customersData = [];
let customerFiltered = [];
let customerPage = 1;
const CUSTOMER_PAGE_SIZE = 8;

function customersTemplate() {
  return `<div class="page-card p-3">
    <div class="d-flex justify-content-between mb-3"><input id="searchInput" class="form-control" style="max-width:320px;" placeholder="Search customer..." /><div class="d-flex gap-2"><button class="btn btn-success" id="exportExcelBtn"><i class="fa-solid fa-file-excel me-1"></i>Excel</button><button class="btn btn-primary" id="addBtn">Add Customer</button></div></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead><tbody id="customersTable"></tbody></table></div>
    <div id="customersPager"></div>
  </div>
  <div class="modal fade" id="customerModal"><div class="modal-dialog"><form class="modal-content" id="customerForm"><div class="modal-header"><h5>Customer</h5><button class="btn-close" type="button" data-bs-dismiss="modal"></button></div><div class="modal-body">
    <input type="hidden" id="customerId"><input class="form-control mb-2" id="customerName" placeholder="Customer Name" required><input class="form-control mb-2" id="phone" placeholder="Phone" required><textarea class="form-control" id="address" placeholder="Address"></textarea>
  </div><div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save</button></div></form></div></div>`;
}

function renderCustomers(list) {
  const pg = paginateRows(list, customerPage, CUSTOMER_PAGE_SIZE);
  customerPage = pg.page;
  document.getElementById("customersTable").innerHTML = pg.items.map((c) => `<tr><td>${c.customerName}</td><td>${c.phone}</td><td>${c.address || ""}</td><td><button class="btn btn-sm btn-warning" onclick='editCustomer(${JSON.stringify(c)})'>Edit</button> ${canDelete() ? `<button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.customerId}')">Delete</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="4" class="text-center">No customer found</td></tr>`;
  renderPager("customersPager", pg.page, pg.totalPages, (next) => { customerPage = next; renderCustomers(customerFiltered); });
}

function editCustomer(c) { Object.keys(c).forEach((k) => document.getElementById(k) && (document.getElementById(k).value = c[k])); new bootstrap.Modal(document.getElementById("customerModal")).show(); }
async function deleteCustomer(customerId) { if (!confirm("Delete customer?")) return; await apiRequest("deleteCustomer", { customerId }); await initCustomers(); }

async function initCustomers() {
  renderLayout("customers", t("customers"), customersTemplate());
  showLoader(true);
  customersData = await fetchList("getCustomers");
  showLoader(false);
  customerFiltered = [...customersData];
  renderCustomers(customerFiltered);
  exportExcelBtn.onclick = () => exportJsonToExcel("customers.xlsx", customerFiltered);
  document.getElementById("addBtn").onclick = () => { document.getElementById("customerForm").reset(); document.getElementById("customerId").value = ""; new bootstrap.Modal(document.getElementById("customerModal")).show(); };
  document.getElementById("searchInput").oninput = (e) => {
    customerPage = 1;
    const q = e.target.value.toLowerCase();
    customerFiltered = customersData.filter((x) => x.customerName.toLowerCase().includes(q) || String(x.phone || "").includes(q));
    renderCustomers(customerFiltered);
  };
  document.getElementById("customerForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = { customerId: customerId.value, customerName: customerName.value.trim(), phone: phone.value.trim(), address: address.value.trim() };
    if (!validatePhone(payload.phone)) return showToast("Invalid phone number", "danger");
    await apiRequest(payload.customerId ? "updateCustomer" : "addCustomer", payload);
    bootstrap.Modal.getInstance(document.getElementById("customerModal")).hide();
    await initCustomers();
    showToast("Customer saved");
  };
}
document.addEventListener("DOMContentLoaded", () => initCustomers().catch((e) => showToast(e.message, "danger")));
