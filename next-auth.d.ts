// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's role */
      role?: "admin" | "user" | string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: "admin" | "user" | string;
    user?: string
  }
}
