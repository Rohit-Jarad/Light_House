/**
 * Jarad Machinery & Electrical - Google Apps Script Backend
 * Single endpoint API with Google Sheets as database.
 */
const SHEET_NAMES = {
  Users: "Users",
  Products: "Products",
  Vendors: "Vendors",
  Customers: "Customers",
  Quotations: "Quotations",
  QuotationItems: "QuotationItems",
  Bills: "Bills",
  BillItems: "BillItems",
  Payments: "Payments",
  Settings: "Settings",
  Reports: "Reports"
};

function doGet() {
  return output({ success: true, message: "API running" });
}

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = req.action;
    let result = {};
    switch (action) {
      case "login": result = login_(req); break;
      case "getUsers": result = { data: readAll_("Users") }; break;
      case "addUser": result = addRecord_("Users", req, "userId", "USR"); break;
      case "updateUser": result = updateRecord_("Users", "userId", req); break;
      case "setUserActive": result = setUserActive_(req); break;
      case "getProducts": result = { data: readAll_("Products") }; break;
      case "addProduct": result = addRecord_("Products", req, "productId", "PRD"); break;
      case "updateProduct": result = updateRecord_("Products", "productId", req); break;
      case "deleteProduct": result = deleteRecord_("Products", "productId", req.productId); break;
      case "getVendors": result = { data: readAll_("Vendors") }; break;
      case "addVendor": result = addRecord_("Vendors", req, "vendorId", "VND"); break;
      case "updateVendor": result = updateRecord_("Vendors", "vendorId", req); break;
      case "deleteVendor": result = deleteRecord_("Vendors", "vendorId", req.vendorId); break;
      case "getCustomers": result = { data: readAll_("Customers") }; break;
      case "addCustomer": result = addRecord_("Customers", req, "customerId", "CST"); break;
      case "updateCustomer": result = updateRecord_("Customers", "customerId", req); break;
      case "deleteCustomer": result = deleteRecord_("Customers", "customerId", req.customerId); break;
      case "createQuotation": result = createQuotation_(req); break;
      case "getQuotations": result = { data: readAll_("Quotations") }; break;
      case "createBill": result = createBill_(req); break;
      case "getBills": result = { data: readAll_("Bills") }; break;
      case "addPayment": result = addRecord_("Payments", req, "paymentId", "PAY"); break;
      case "getPayments": result = { data: readAll_("Payments") }; break;
      case "getSettings": result = { data: readAll_("Settings") }; break;
      case "saveSettings": result = saveSettings_(req); break;
      case "getReports": result = { data: reportSummary_() }; break;
      default: throw new Error("Unknown action: " + action);
    }
    return output(Object.assign({ success: true }, result));
  } catch (err) {
    return output({ success: false, message: err.message });
  }
}

function output(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error("Missing sheet: " + name);
  return sh;
}

function readAll_(sheetKey) {
  const sh = getSheet_(SHEET_NAMES[sheetKey]);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  const isDeletedIndex = headers.indexOf("isDeleted");
  const deletedAtIndex = headers.indexOf("deletedAt");
  return values.slice(1).filter((r) => {
    if (r.join("") === "") return false;
    if (isDeletedIndex > -1 && String(r[isDeletedIndex]).toLowerCase() === "true") return false;
    if (deletedAtIndex > -1 && String(r[deletedAtIndex]).trim() !== "") return false;
    return true;
  }).map((row) => {
    const item = {};
    headers.forEach((h, i) => item[h] = row[i]);
    return item;
  });
}

function addRecord_(sheetKey, payload, idField, prefix) {
  const sh = getSheet_(SHEET_NAMES[sheetKey]);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const id = payload[idField] || (prefix + "-" + new Date().getTime());
  const row = headers.map((h) => {
    if (h === idField) return id;
    if (h === "createdAt") return new Date().toISOString();
    if (h === "isDeleted") return false;
    if (h === "isActive") return payload[h] !== undefined ? payload[h] : true;
    return payload[h] !== undefined ? payload[h] : "";
  });
  sh.appendRow(row);
  return { id: id };
}

function updateRecord_(sheetKey, idField, payload) {
  const sh = getSheet_(SHEET_NAMES[sheetKey]);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idField);
  const rowIndex = values.findIndex((r, i) => i > 0 && String(r[idIndex]) === String(payload[idField]));
  if (rowIndex === -1) throw new Error("Record not found");
  headers.forEach((h, i) => {
    if (payload[h] !== undefined) sh.getRange(rowIndex + 1, i + 1).setValue(payload[h]);
  });
  return { message: "Updated" };
}

function deleteRecord_(sheetKey, idField, idValue) {
  const sh = getSheet_(SHEET_NAMES[sheetKey]);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idField);
  const isDeletedIndex = headers.indexOf("isDeleted");
  const deletedAtIndex = headers.indexOf("deletedAt");
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idIndex]) === String(idValue)) {
      if (isDeletedIndex > -1) sh.getRange(i + 1, isDeletedIndex + 1).setValue(true);
      if (deletedAtIndex > -1) sh.getRange(i + 1, deletedAtIndex + 1).setValue(new Date().toISOString());
      if (isDeletedIndex === -1 && deletedAtIndex === -1) sh.deleteRow(i + 1);
      return { message: "Soft deleted" };
    }
  }
  throw new Error("Record not found");
}

function login_(req) {
  const users = readAll_("Users");
  const user = users.find((u) =>
    String(u.username) === String(req.username) &&
    String(u.password) === String(req.password) &&
    String(u.isActive || "true").toLowerCase() !== "false"
  );
  if (!user) throw new Error("Invalid credentials");
  return { user: { userId: user.userId, name: user.name, role: user.role, username: user.username } };
}

function setUserActive_(req) {
  const sh = getSheet_(SHEET_NAMES.Users);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("userId");
  const activeIndex = headers.indexOf("isActive");
  if (activeIndex === -1) throw new Error("Users sheet requires isActive column");
  const rowIndex = values.findIndex((r, i) => i > 0 && String(r[idIndex]) === String(req.userId));
  if (rowIndex === -1) throw new Error("User not found");
  sh.getRange(rowIndex + 1, activeIndex + 1).setValue(!!req.isActive);
  return { message: "User access updated" };
}

function createQuotation_(req) {
  const quotationId = "QTN-" + new Date().getTime();
  addRecord_("Quotations", {
    quotationId: quotationId,
    customerId: req.customerId,
    quotationDate: new Date().toISOString().slice(0, 10),
    subtotal: req.subtotal || 0,
    discount: req.discount || 0,
    gst: req.gst || 0,
    total: req.total || 0,
    status: req.status || "Draft",
    createdAt: new Date().toISOString()
  }, "quotationId", "QTN");
  (req.items || []).forEach((it) => addRecord_("QuotationItems", Object.assign({}, it, { quotationId: quotationId }), "itemId", "QTI"));
  return { quotationId: quotationId };
}

function createBill_(req) {
  const billId = "BIL-" + new Date().getTime();
  addRecord_("Bills", {
    billId: billId,
    customerId: req.customerId,
    billDate: new Date().toISOString().slice(0, 10),
    subtotal: req.subtotal || 0,
    gst: req.gst || 0,
    total: req.total || 0,
    paymentStatus: req.paymentStatus || "Pending",
    createdAt: new Date().toISOString()
  }, "billId", "BIL");
  (req.items || []).forEach((it) => addRecord_("BillItems", Object.assign({}, it, { billId: billId }), "itemId", "BIT"));
  return { billId: billId };
}

function saveSettings_(req) {
  const sh = getSheet_(SHEET_NAMES.Settings);
  if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  addRecord_("Settings", req, "businessName", "SET");
  return { message: "Settings saved" };
}

function reportSummary_() {
  const products = readAll_("Products");
  const customers = readAll_("Customers");
  const vendors = readAll_("Vendors");
  const quotations = readAll_("Quotations");
  const bills = readAll_("Bills");
  const payments = readAll_("Payments");

  const monthlyRevenue = bills
    .filter((b) => (b.billDate || "").slice(0, 7) === Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM"))
    .reduce((sum, b) => sum + Number(b.total || 0), 0);
  const dailyRevenue = bills
    .filter((b) => (b.billDate || "").slice(0, 10) === Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"))
    .reduce((sum, b) => sum + Number(b.total || 0), 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyRevenue = bills
    .filter((b) => new Date(b.billDate || "2000-01-01").getTime() >= weekAgo.getTime())
    .reduce((sum, b) => sum + Number(b.total || 0), 0);
  const yearlyRevenue = bills
    .filter((b) => (b.billDate || "").slice(0, 4) === Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy"))
    .reduce((sum, b) => sum + Number(b.total || 0), 0);
  const pendingPayments = bills
    .filter((b) => String(b.paymentStatus).toLowerCase() !== "paid")
    .reduce((sum, b) => sum + Number(b.total || 0), 0);

  return {
    totalProducts: products.length,
    totalCustomers: customers.length,
    totalVendors: vendors.length,
    totalQuotations: quotations.length,
    totalBills: bills.length,
    monthlyRevenue: monthlyRevenue,
    dailyRevenue: dailyRevenue,
    weeklyRevenue: weeklyRevenue,
    yearlyRevenue: yearlyRevenue,
    pendingPayments: pendingPayments,
    monthlySales: buildMonthlySales_(bills),
    productSales: buildProductSales_()
  };
}

function buildMonthlySales_(bills) {
  const map = {};
  bills.forEach((b) => {
    const m = (b.billDate || "").slice(0, 7) || "Unknown";
    map[m] = (map[m] || 0) + Number(b.total || 0);
  });
  return Object.keys(map).sort().map((k) => ({ month: k, total: map[k] }));
}

function buildProductSales_() {
  const items = readAll_("BillItems");
  const products = readAll_("Products");
  const productMap = {};
  products.forEach((p) => productMap[p.productId] = p.productName);
  const map = {};
  items.forEach((it) => {
    const name = productMap[it.productId] || it.productId;
    map[name] = (map[name] || 0) + Number(it.quantity || 0);
  });
  return Object.keys(map).slice(0, 10).map((k) => ({ name: k, qty: map[k] }));
}
