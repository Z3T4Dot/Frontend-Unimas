export type AuthUser = { id: string; email: string };

const TOKEN_KEY = "unimas.token";
const USER_KEY = "unimas.user";
const EVT = "unimas-auth";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function getUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}
function notify() {
  window.dispatchEvent(new Event(EVT));
}

export function setAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notify();
}
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notify();
}

export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  const handler = () => cb(getUser());
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}
