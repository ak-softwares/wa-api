import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "../../../../lib/mongoose";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            id: "credentials", // keep same id for email login
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

        // 📌 New OTP login provider
        Credentials({
            id: "phone-otp", // unique id for phone login
            name: "Phone OTP",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) {
                    throw new Error("Missing phone or OTP");
                }
                try{
                    // ✅ Validate OTP from otpStore
                    const otpRecord = globalThis.otpStore?.[credentials.phone];
                    if (!otpRecord) throw new Error("OTP expired or not found");

                    if (otpRecord.code !== credentials.otp) throw new Error("Invalid OTP");
                    if (Date.now() > otpRecord.expiresAt) throw new Error("OTP expired");

                    // OTP is valid → check if user exists
                    await connectDB();
                    let user = await User.findOne({ phone: credentials.phone });

                    if (!user) {
                        throw new Error("User not found, Please Sign Up");
                    }

                    // ✅ OTP can only be used once
                    delete globalThis.otpStore[credentials.phone];

                    // ✅ Must return a plain object with id, phone, email, etc.
                    return user;
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
        signIn: '/auth/login',   // <-- this is your login page
        signOut: '/auth/login',  // <-- redirect to login after logout
        error: "/auth/login",     // errors also go to login
        // verifyRequest: '/auth/verify-request', // optional, can remove
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET
};