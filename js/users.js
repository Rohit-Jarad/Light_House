let usersData = [];

function usersTemplate() {
  return `<div class="page-card p-3">
    <div class="d-flex justify-content-between mb-3">
      <h5 class="mb-0">Client Access Control</h5>
      <button class="btn btn-primary" id="addUserBtn">Add Client User</button>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Phone</th><th>Actions</th></tr></thead><tbody id="usersTable"></tbody></table></div>
  </div>
  <div class="modal fade" id="userModal"><div class="modal-dialog"><form class="modal-content" id="userForm">
    <div class="modal-header"><h5 class="modal-title">Client User</h5><button class="btn-close" type="button" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input type="hidden" id="userId" />
      <input class="form-control mb-2" id="name" placeholder="Full name" required />
      <input class="form-control mb-2" id="username" placeholder="Username" required />
      <input class="form-control mb-2" id="password" placeholder="Password" required />
      <select class="form-select mb-2" id="role"><option>Staff</option><option>Admin</option></select>
      <input class="form-control" id="phone" placeholder="Phone" required />
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save</button></div>
  </form></div></div>`;
}

function renderUsers() {
  usersTable.innerHTML = usersData.map((u) => `<tr>
    <td>${u.name}</td><td>${u.username}</td><td>${u.role}</td><td>${u.isActive === false || String(u.isActive).toLowerCase() === "false" ? "<span class='badge text-bg-danger'>Inactive</span>" : "<span class='badge text-bg-success'>Active</span>"}</td><td>${u.phone || ""}</td>
    <td><button class="btn btn-sm btn-warning" onclick='editUser(${JSON.stringify(u)})'>Edit</button> <button class="btn btn-sm btn-outline-danger" onclick='toggleUser("${u.userId}", ${u.isActive === false || String(u.isActive).toLowerCase() === "false"})'>${u.isActive === false || String(u.isActive).toLowerCase() === "false" ? "Activate" : "Inactivate"}</button></td>
  </tr>`).join("");
}

function editUser(u) {
  ["userId", "name", "username", "password", "role", "phone"].forEach((k) => document.getElementById(k).value = u[k] || "");
  new bootstrap.Modal(userModal).show();
}

async function toggleUser(userId, inactiveNow) {
  await apiRequest("setUserActive", { userId, isActive: inactiveNow ? true : false });
  showToast("User status updated");
  await initUsers();
}

async function initUsers() {
  if (!isSuperAdmin()) return (window.location.href = "dashboard.html");
  renderLayout("users", "Client Access", usersTemplate());
  showLoader(true);
  usersData = await fetchList("getUsers");
  showLoader(false);
  renderUsers();
  addUserBtn.onclick = () => {
    userForm.reset();
    userId.value = "";
    role.value = "Staff";
    new bootstrap.Modal(userModal).show();
  };
  userForm.onsubmit = async (e) => {
    e.preventDefault();
    const payload = { userId: userId.value, name: name.value.trim(), username: username.value.trim(), password: password.value.trim(), role: role.value, phone: phone.value.trim(), isActive: true };
    await apiRequest(payload.userId ? "updateUser" : "addUser", payload);
    bootstrap.Modal.getInstance(userModal).hide();
    await initUsers();
  };
}

document.addEventListener("DOMContentLoaded", () => initUsers().catch((e) => showToast(e.message, "danger")));
