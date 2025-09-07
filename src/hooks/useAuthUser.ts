import { useEffect, useState } from "react";
import { getUser, onAuthChange } from "../lib/auth";
import type { AuthUser } from "../lib/auth";

export default function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(getUser());
  useEffect(() => onAuthChange(setUser), []);
  return user;
}
