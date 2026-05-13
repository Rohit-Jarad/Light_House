function getSession() {
  const raw = localStorage.getItem("sessionUser");
  return raw ? JSON.parse(raw) : null;
}

function setSession(user) {
  localStorage.setItem("sessionUser", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("sessionUser");
}

function requireAuth() {
  const user = getSession();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function canDelete() {
  const user = getSession();
  return user && user.role === "Admin";
}

async function login(username, password) {
  const result = await apiRequest("login", { username, password });
  setSession(result.user);
  return result.user;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-logout]");
  if (!btn) return;
  clearSession();
  window.location.href = "login.html";
});
