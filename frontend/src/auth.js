const KEY = "mm_auth";

export function saveAuth(token, role) {
  localStorage.setItem(KEY, JSON.stringify({ token, role }));
}

export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { token, role } = JSON.parse(raw);
    if (!token || !role) return null;
    const payload = decodeJwt(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      localStorage.removeItem(KEY);
      return null;
    }
    return { token, role };
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function getToken() {
  return loadAuth()?.token || null;
}

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}
