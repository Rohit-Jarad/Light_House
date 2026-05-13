async function initSettings() {
  if (!isAdmin()) {
    renderLayout("settings", t("settings"), `<div class="page-card p-4"><h5>Settings access is only for Admin</h5><p class="text-muted mb-0">Staff users cannot change business configuration.</p></div>`);
    return;
  }
  renderLayout("settings", t("settings"), `
    <div class="page-card p-3">
      <p class="text-muted">Update your business profile details shown in quotation and invoice documents.</p>
      <form id="settingsForm" class="row g-3">
        <div class="col-md-6"><label class="form-label">Business Name</label><input id="businessName" class="form-control" required></div>
        <div class="col-md-6"><label class="form-label">Owner Name</label><input id="ownerName" class="form-control" required></div>
        <div class="col-md-6"><label class="form-label">Phone</label><input id="phone" class="form-control" required></div>
        <div class="col-md-6"><label class="form-label">Email</label><input id="email" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Address</label><input id="address" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">GST Number</label><input id="gstNumber" class="form-control"></div>
        <div class="col-12"><button class="btn btn-primary">Save Settings</button></div>
      </form>
    </div>
  `);
  const settings = await fetchList("getSettings");
  const row = settings[0] || {
    businessName: "Jarad Machinery & Electrical",
    ownerName: "जराड प्रशांत",
    phone: "9922556171",
    email: "",
    address: "",
    gstNumber: ""
  };
  ["businessName", "ownerName", "phone", "email", "address", "gstNumber"].forEach((k) => document.getElementById(k).value = row[k] || "");
  settingsForm.onsubmit = async (e) => {
    e.preventDefault();
    const payload = { businessName: businessName.value.trim(), ownerName: ownerName.value.trim(), phone: phone.value.trim(), email: email.value.trim(), address: address.value.trim(), gstNumber: gstNumber.value.trim(), logo: "" };
    if (!validatePhone(payload.phone)) return showToast("Invalid phone number", "danger");
    await apiRequest("saveSettings", payload);
    showToast("Settings saved");
  };
}
document.addEventListener("DOMContentLoaded", () => initSettings().catch((e) => showToast(e.message, "danger")));
