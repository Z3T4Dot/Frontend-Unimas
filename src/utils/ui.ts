export function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function initialsFrom(name?: string | null, email?: string | null) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = (parts.length > 1 ? parts[parts.length - 1][0] : "") || "";
    const res = (first + last).toUpperCase();
    if (res) return res;
  }
  if (email) {
    const local = email.split("@")[0] || "";
    const bits = local.split(/[._-]+/);
    const a = bits[0]?.[0] || local[0] || "";
    const b = bits[1]?.[0] || local[1] || "";
    const res = (a + b).toUpperCase();
    if (res) return res;
  }
  return "U";
}
