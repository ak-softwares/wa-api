import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "../../../../lib/mongoose";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }
                try {
                    await connectDB();
                    const user = await User.findOne({ email : credentials.email });
                    if(!user) {
                        throw new Error("User not found");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if(!isPasswordValid) {
                        throw new Error("Invalid password");
                    }
                    return {
                        id: user.id.toString(),
                        email: user.email
                    }
                }catch(e){
                    throw e;
                }
            },
        }),
        // ...add google provider
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks: {
        /**
         * Called before redirect
         */
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDB();

                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                // ❌ user not found → redirect to signup page
                // Must return an absolute URL (NextAuth requirement)
                return "/auth/signup?newUser=1&email=" + encodeURIComponent(user.email ?? "");
                }
            }

            return true; // ✅ allow sign in

        },

        async session({ session, user }) {
            if (user) {
                session.user.id = user.id.toString();
                session.user.email = user.email;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id?.toString();
                token.email = user.email;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        // newUser: null // Will disable the new account creation screen
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET
};