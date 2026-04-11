import { clearAuth, getToken } from "./auth.js";

class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `HTTP ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

async function request(method, path, { body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(path, { method, headers, body: payload });

  if (res.status === 401) {
    clearAuth();
    window.location.reload();
    throw new ApiError(401, "unauthorized");
  }
  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.detail || "request failed");
  }
  return data;
}

export const api = {
  login: (code) => request("POST", "/api/auth/login", { body: { code } }),

  // admin guests
  listGuests: () => request("GET", "/api/admin/guests"),
  createGuest: (body) => request("POST", "/api/admin/guests", { body }),
  updateGuest: (id, body) => request("PUT", `/api/admin/guests/${id}`, { body }),
  deleteGuest: (id) => request("DELETE", `/api/admin/guests/${id}`),

  // admin tokens
  listTokens: () => request("GET", "/api/admin/tokens"),
  createToken: (body) => request("POST", "/api/admin/tokens", { body }),
  updateToken: (id, body) => request("PUT", `/api/admin/tokens/${id}`, { body }),
  deleteToken: (id) => request("DELETE", `/api/admin/tokens/${id}`),

  // admin uploads
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("POST", "/api/admin/uploads", { form: fd });
  },

  // visitor
  visitorGuests: () => request("GET", "/api/visitor/guests"),
  visitorGuestDetail: (id) => request("GET", `/api/visitor/guests/${id}`),
};

export { ApiError };
