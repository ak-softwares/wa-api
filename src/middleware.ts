import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow auth routes
        if (pathname.startsWith("/auth")) return true;

        // Allow NextAuth API routes
        if (pathname.startsWith("/api/auth")) return true;

        // Protect dashboard
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
