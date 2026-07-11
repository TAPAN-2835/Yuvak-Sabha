import { useEffect, useState } from "react";
import { getSession } from "@/services/authService";
import type { AuthSession } from "@/types";

export function useAuth(): AuthSession | null {
  const [s, setS] = useState<AuthSession | null>(() => getSession());
  useEffect(() => {
    const h = () => setS(getSession());
    window.addEventListener("baps-auth-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("baps-auth-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return s;
}
