const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('fairdrop-auth-change'));
  }
}

export function setTokens(tokens) {
  sessionStorage.setItem('fairDropAccessToken', tokens.access);
  sessionStorage.setItem('fairDropRefreshToken', tokens.refresh);
  notifyAuthChange();
}

export function clearTokens() {
  sessionStorage.removeItem('fairDropAccessToken');
  sessionStorage.removeItem('fairDropRefreshToken');
  notifyAuthChange();
}

export function isAdminUser() {
  const token = sessionStorage.getItem('fairDropAccessToken');
  if (!token) return false;

  try {
    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
    return payload.is_staff === true;
  } catch {
    return false;
  }
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const access = auth ? sessionStorage.getItem('fairDropAccessToken') : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail || Object.values(payload || {}).flat().join(' ') || `Request failed (${response.status})`;
    if (response.status === 401 && auth) {
      clearTokens();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    throw new Error(detail);
  }
  return payload;
}

export async function login(email, password) {
  const tokens = await apiRequest('/auth/login/', { method: 'POST', body: { username: email.trim(), password }, auth: false });
  setTokens(tokens);
  return tokens;
}

export const configuredDropId = import.meta.env.VITE_DEMO_DROP_ID || '1';

