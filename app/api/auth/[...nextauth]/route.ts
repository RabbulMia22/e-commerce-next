import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Credentials login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await dbConnect();
          
          // Find user with password field
          const user = await (User as any).findOne({ email: credentials.email as string });
          
          if (!user) {
            throw new Error("No user found with the given email");
          }

          if (!user.password) {
            throw new Error("Invalid login method");
          }

          // Compare password using bcrypt
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // ✅ Return data that matches your schema
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
          } as any;
        } catch (error) {
          console.error("Authorization error:", error);
          throw error as any;
        }
      }
    }),

    // ✅ Google OAuth login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // Runs when a user signs in
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile) {
          await dbConnect();
          
          const existingUser = await (User as any).findOne({ email: (profile as any).email });
          
          if (!existingUser) {
            // ✅ Create user with fields that exist in your schema
            await (User as any).create({
              name: (profile as any).name || `${(profile as any).given_name || ''} ${(profile as any).family_name || ''}`.trim(),
              email: (profile as any).email,
              role: "user",
            });
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    // ✅ JWT callback that matches your schema
    async jwt({ token, user }) {
       if (user) {
        token.id = user.id;
      }
      const t = token as any;

      // If user just signed in, set initial token data
      if (user) {
        t.id = (user as any).id;
        t.role = (user as any).role || "user";
        t.name = (user as any).name;
        t.phone = (user as any).phone;
        t.email = (user as any).email || t.email; // ensure email is present for lookups
      }

      // Prepare safe lookup
      const hasValidId = typeof t.id === 'string' && /^[0-9a-fA-F]{24}$/.test(t.id);
      const lookup = hasValidId ? { _id: t.id } : (t.email ? { email: t.email } : null);

      if (lookup) {
        try {
          await dbConnect();
          const dbUser = await (User as any).findOne(lookup).select("role _id email name phone");
          if (dbUser) {
            t.id = dbUser._id.toString();
            t.role = dbUser.role || "user";
            t.name = dbUser.name;
            t.phone = dbUser.phone;
            t.email = dbUser.email;
          }
        } catch (error) {
          console.error("❌ JWT Callback - DB lookup error:", error);
        }
      }

      return t as JWT;
    },

    // ✅ Session callback that matches your schema
    async session({ session, token }) {
      const t = token as any;
      if (t && session.user) {
        (session.user as any).id = t.id;
        (session.user as any).role = t.role || "user";
        (session.user as any).name = t.name || session.user.name;
        (session.user as any).phone = t.phone;
      }
      return session;
    },
  },

  pages: {
    signIn: '/authentication/login',
    error: '/authentication/error',
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };