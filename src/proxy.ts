import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { LOGIN_PATH } from "./utiles/auth/auth";

export default withAuth(
  function proxy() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: LOGIN_PATH,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};