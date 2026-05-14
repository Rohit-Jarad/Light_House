const API_BASE_URL = localStorage.getItem("apiBaseUrl") || "https://script.google.com/macros/s/AKfycbwNuSxrdo3NdVT4EkVYZCxFE6RyoEhbxbEgm0ivDRvgC7EvpAzMcVyD4_qd6xbiveOe/exec";


async function apiRequest(action, payload = {}) {
  const body = { action, ...payload };
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("Network error");
  const json = await response.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json;
}

async function fetchList(action) {
  const result = await apiRequest(action);
  return result.data || [];
}
