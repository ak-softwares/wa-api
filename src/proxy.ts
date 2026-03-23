import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { LOGIN_PATH, SETUP_PATH } from "./utiles/auth/auth";

export default async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const setupTokenFromHeader = req.headers.get("x-setup-token");
  const setupTokenFromQuery = searchParams.get("token");
  const setupToken = setupTokenFromHeader ?? setupTokenFromQuery;

  if (pathname.startsWith(SETUP_PATH) && setupToken) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-setup-auth", "1");
    requestHeaders.set("x-setup-token", setupToken);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};