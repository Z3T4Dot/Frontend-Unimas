export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "tecnico" | "cliente" | string;
};

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

export function setAuth(token: string, user?: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  notify();
}

export function setUser(user: AuthUser): void {
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

/** Normaliza y devuelve ruta de inicio según rol. */
export function homeByRole(role?: string): string {
  const r = (role || "")
    .normalize("NFKD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .trim()
    .toLowerCase();
  if (r === "tecnico") return "/tech/appointments";
  if (r === "admin") return "/admin";
  return "/book"; // cliente/default
}
