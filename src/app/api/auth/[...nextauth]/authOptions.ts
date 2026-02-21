import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "../../../../lib/mongoose";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
import axios from "axios";

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
                    const user = await UserModel.findOne({ email : credentials.email });
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
          id: "phone-otp",
          name: "Phone OTP",
          credentials: {
            phone: { label: "Phone", type: "text" },
            otp: { label: "OTP", type: "text" },
          },

          async authorize(credentials) {
            if (!credentials?.phone || !credentials?.otp) {
              throw new Error("Missing phone or OTP");
            }

            try {
              // 🔹 Call your backend verify OTP API
              const res = await axios.post(
                `${process.env.NEXTAUTH_URL}/api/auth/verify-otp`,
                {
                  phone: credentials.phone,
                  otp: credentials.otp,
                }
              );

              const data = res.data;

              if (!data.success) {
                  throw new Error(data.message || "Invalid OTP");
              }

              const user = data.data.user;

              if (!user) {
                  throw new Error("User not found");
              }

              // ✅ Return plain object (important for NextAuth)
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
              };
            } catch (error: any) {
              throw new Error(
                  error?.response?.data?.message || error.message || "Login failed"
              );
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

                const existingUser = await UserModel.findOne({ email: user.email });

                if (!existingUser) {
                // ❌ user not found → redirect to signup page
                // Must return an absolute URL (NextAuth requirement)
                return "/auth/signup?newUser=1&email=" + encodeURIComponent(user.email ?? "");
                }
            }

            return true; // ✅ allow sign in
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id?.toString();
                token.email = user.email;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
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