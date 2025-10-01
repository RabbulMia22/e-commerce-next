import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    // ✅ Credentials login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found with the given email");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
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
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: profile.email });
        if (!existingUser) {
          await User.create({
            name: profile.name,
            email: profile.email,
            password: "", // no password for Google users
            image: profile.picture,
            role: "user",
          });
        }
      }
      return true; // allow sign in
    },

    // Modify JWT
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      return token;
    },

  
    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
