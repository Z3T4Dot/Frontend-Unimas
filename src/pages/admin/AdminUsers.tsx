import { useEffect, useState } from "react";
import { AdminAPI } from "../../lib/adminApi";

type UserRow = {
  id: string;
  display_name: string;
  role: string;
  email: string | null;
  created_at: string;
};

export default function AdminUsers() {
  const [role, setRole] = useState<string>("");
  const [items, setItems] = useState<UserRow[]>([]);

  const load = async () =>
    setItems(await AdminAPI.listUsers(role || undefined));
  useEffect(() => {
    load();
  }, [role]);

  const changeRole = async (u: UserRow, newRole: string) => {
    await AdminAPI.updateUserRole(u.id, newRole);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Usuarios</h1>

      <div className="flex gap-2">
        {["", "cliente", "tecnico", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-3 py-2 rounded-xl border ${
              role === r ? "bg-black text-white border-black" : "bg-white"
            }`}
          >
            {r === "" ? "Todos" : r}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((u) => (
          <div
            key={u.id}
            className="bg-white border rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">
                {u.display_name}{" "}
                <span className="text-xs text-zinc-500">
                  ({u.email || "—"})
                </span>
              </div>
              <div className="text-sm text-zinc-600">{u.role}</div>
            </div>
            <div className="flex gap-2">
              {["cliente", "tecnico", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => changeRole(u, r)}
                  className={`px-3 py-2 rounded-xl border ${
                    u.role === r
                      ? "bg-black text-white border-black"
                      : "bg-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
