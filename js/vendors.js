let vendorsData = [];
let vendorFiltered = [];
let vendorPage = 1;
const VENDOR_PAGE_SIZE = 8;

function vendorsTemplate() {
  return `<div class="page-card p-3">
    <div class="d-flex justify-content-between mb-3"><input id="searchInput" class="form-control" style="max-width:320px;" placeholder="Search vendor..." /><div class="d-flex gap-2"><button class="btn btn-success" id="exportExcelBtn"><i class="fa-solid fa-file-excel me-1"></i>Excel</button><button class="btn btn-primary" id="addBtn">Add Vendor</button></div></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>GST</th><th>Actions</th></tr></thead><tbody id="vendorsTable"></tbody></table></div>
    <div id="vendorsPager"></div>
  </div>
  <div class="modal fade" id="vendorModal"><div class="modal-dialog"><form class="modal-content" id="vendorForm"><div class="modal-header"><h5>Vendor</h5><button class="btn-close" type="button" data-bs-dismiss="modal"></button></div><div class="modal-body">
    <input type="hidden" id="vendorId"><input class="form-control mb-2" id="vendorName" placeholder="Vendor Name" required><input class="form-control mb-2" id="phone" placeholder="Phone" required><input class="form-control mb-2" id="address" placeholder="Address"><input class="form-control" id="gstNumber" placeholder="GST Number">
  </div><div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save</button></div></form></div></div>`;
}

function renderVendors(list) {
  const pg = paginateRows(list, vendorPage, VENDOR_PAGE_SIZE);
  vendorPage = pg.page;
  document.getElementById("vendorsTable").innerHTML = pg.items.map((v) => `<tr><td>${v.vendorName}</td><td>${v.phone}</td><td>${v.address || ""}</td><td>${v.gstNumber || ""}</td><td><button class="btn btn-sm btn-warning" onclick='editVendor(${JSON.stringify(v)})'>Edit</button> ${canDelete() ? `<button class="btn btn-sm btn-danger" onclick="deleteVendor('${v.vendorId}')">Delete</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="5" class="text-center">No vendor found</td></tr>`;
  renderPager("vendorsPager", pg.page, pg.totalPages, (next) => { vendorPage = next; renderVendors(vendorFiltered); });
}

function editVendor(v) { Object.keys(v).forEach((k) => document.getElementById(k) && (document.getElementById(k).value = v[k])); new bootstrap.Modal(document.getElementById("vendorModal")).show(); }
async function deleteVendor(vendorId) { if (!confirm("Delete vendor?")) return; await apiRequest("deleteVendor", { vendorId }); await initVendors(); }

async function initVendors() {
  renderLayout("vendors", t("vendors"), vendorsTemplate());
  showLoader(true);
  vendorsData = await fetchList("getVendors");
  showLoader(false);
  vendorFiltered = [...vendorsData];
  renderVendors(vendorFiltered);
  exportExcelBtn.onclick = () => exportJsonToExcel("vendors.xlsx", vendorFiltered);
  document.getElementById("addBtn").onclick = () => { document.getElementById("vendorForm").reset(); document.getElementById("vendorId").value = ""; new bootstrap.Modal(document.getElementById("vendorModal")).show(); };
  document.getElementById("searchInput").oninput = (e) => {
    vendorPage = 1;
    const q = e.target.value.toLowerCase();
    vendorFiltered = vendorsData.filter((x) => x.vendorName.toLowerCase().includes(q) || String(x.phone || "").includes(q));
    renderVendors(vendorFiltered);
  };
  document.getElementById("vendorForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = { vendorId: vendorId.value, vendorName: vendorName.value.trim(), phone: phone.value.trim(), address: address.value.trim(), gstNumber: gstNumber.value.trim() };
    if (!validatePhone(payload.phone)) return showToast("Invalid phone number", "danger");
    await apiRequest(payload.vendorId ? "updateVendor" : "addVendor", payload);
    bootstrap.Modal.getInstance(document.getElementById("vendorModal")).hide();
    await initVendors();
    showToast("Vendor saved");
  };
}
document.addEventListener("DOMContentLoaded", () => initVendors().catch((e) => showToast(e.message, "danger")));
