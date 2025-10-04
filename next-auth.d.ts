// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** The user's role */
      role?: "admin" | "user" | string;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: "admin" | "user" | string;
    phone?: string | null;
  }
}
