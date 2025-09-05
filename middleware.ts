import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware() {
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({token,  req}) => {
                const {pathname} = req.nextUrl;
                
                // Allow auth related path
                if(pathname.startsWith('/api/auth') || pathname === "/auth"){
                    return true;
                }

                // Public
                if(pathname === "/") {
                    return true;
                }

                return !!token;
            }
        }
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",   // Protect all dashboard routes
    ],
};