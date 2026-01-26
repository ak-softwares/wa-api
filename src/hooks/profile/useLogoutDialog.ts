import { signOut } from "next-auth/react";

export function useLogoutDialog() {

  const logout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return {
    logout
  };
}
