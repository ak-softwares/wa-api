import { LOGIN_PATH } from "@/utiles/auth/auth";
import { signOut } from "next-auth/react";

export function useLogout() {

  const logout = () => {
    signOut({ callbackUrl: LOGIN_PATH });
  };

  return {
    logout
  };
}
