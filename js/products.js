let products = [];
let vendors = [];
let productPage = 1;
let productFiltered = [];
const PRODUCT_PAGE_SIZE = 8;

function productsPageTemplate() {
  return `
  <div class="page-card p-3">
    <div class="d-flex flex-wrap gap-2 justify-content-between mb-3">
      <input id="searchInput" class="form-control" style="max-width:320px;" placeholder="Search products..." />
      <div class="d-flex gap-2">
        <button class="btn btn-success" id="exportExcelBtn"><i class="fa-solid fa-file-excel me-1"></i>Excel</button>
        <button class="btn btn-primary" id="addBtn">Add Product</button>
      </div>
    </div>
    <div class="table-responsive"><table class="table table-striped"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Vendor</th><th>Description</th><th>Actions</th></tr></thead><tbody id="productsTable"></tbody></table></div>
    <div id="productsPager"></div>
  </div>
  <div class="modal fade" id="productModal"><div class="modal-dialog"><form class="modal-content" id="productForm">
    <div class="modal-header"><h5 class="modal-title">Product</h5><button class="btn-close" data-bs-dismiss="modal" type="button"></button></div>
    <div class="modal-body">
      <input type="hidden" id="productId" />
      <input class="form-control mb-2" id="productName" placeholder="Product name" required />
      <input class="form-control mb-2" id="category" placeholder="Category" required />
      <input class="form-control mb-2" id="price" type="number" min="0" placeholder="Price" required />
      <input class="form-control mb-2" id="stock" type="number" min="0" placeholder="Stock" required />
      <select class="form-select" id="vendorId" required></select>
      <textarea class="form-control mt-2" id="description" placeholder="Description"></textarea>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save</button></div>
  </form></div></div>`;
}

function renderProducts(list) {
  const pg = paginateRows(list, productPage, PRODUCT_PAGE_SIZE);
  productPage = pg.page;
  document.getElementById("productsTable").innerHTML = pg.items.map((p) => `
    <tr><td>${p.productName}</td><td>${p.category}</td><td>${p.price}</td><td>${p.stock}</td><td>${(vendors.find(v => v.vendorId === p.vendorId) || {}).vendorName || "-"}</td><td>${p.description || "-"}</td>
    <td><button class="btn btn-sm btn-warning" onclick='editProduct(${JSON.stringify(p)})'>Edit</button> ${canDelete() ? `<button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.productId}')">Delete</button>` : ""}</td></tr>
  `).join("") || `<tr><td colspan="7" class="text-center">No products found</td></tr>`;
  renderPager("productsPager", pg.page, pg.totalPages, (next) => {
    productPage = next;
    renderProducts(productFiltered);
  });
}

function editProduct(p) {
  Object.keys(p).forEach((k) => { const el = document.getElementById(k); if (el) el.value = p[k]; });
  new bootstrap.Modal(document.getElementById("productModal")).show();
}

async function deleteProduct(productId) {
  if (!confirm("Delete this product?")) return;
  await apiRequest("deleteProduct", { productId });
  await initProducts();
}

async function initProducts() {
  renderLayout("products", t("products"), productsPageTemplate());
  showLoader(true);
  products = await fetchList("getProducts");
  vendors = await fetchList("getVendors");
  showLoader(false);
  productFiltered = [...products];
  document.getElementById("vendorId").innerHTML = vendors.map((v) => `<option value="${v.vendorId}">${v.vendorName}</option>`).join("");
  renderProducts(productFiltered);
  exportExcelBtn.onclick = () => exportJsonToExcel("products.xlsx", productFiltered);
  document.getElementById("addBtn").onclick = () => { document.getElementById("productForm").reset(); document.getElementById("productId").value = ""; new bootstrap.Modal(document.getElementById("productModal")).show(); };
  document.getElementById("searchInput").oninput = (e) => {
    const q = e.target.value.toLowerCase();
    productPage = 1;
    productFiltered = products.filter((p) =>
      p.productName.toLowerCase().includes(q) ||
      String(p.category || "").toLowerCase().includes(q) ||
      String(p.description || "").toLowerCase().includes(q)
    );
    renderProducts(productFiltered);
  };
  document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      productId: document.getElementById("productId").value,
      productName: document.getElementById("productName").value.trim(),
      category: document.getElementById("category").value.trim(),
      price: document.getElementById("price").value,
      stock: document.getElementById("stock").value,
      vendorId: document.getElementById("vendorId").value,
      description: document.getElementById("description").value.trim()
    };
    const duplicate = products.some((p) => p.productName.toLowerCase() === payload.productName.toLowerCase() && p.productId !== payload.productId);
    if (duplicate) return showToast("Duplicate product", "danger");
    await apiRequest(payload.productId ? "updateProduct" : "addProduct", payload);
    bootstrap.Modal.getInstance(document.getElementById("productModal")).hide();
    showToast("Saved successfully");
    await initProducts();
  };
}

document.addEventListener("DOMContentLoaded", () => initProducts().catch((e) => showToast(e.message, "danger")));
