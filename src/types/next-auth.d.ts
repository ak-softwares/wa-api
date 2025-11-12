import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
  }
}
