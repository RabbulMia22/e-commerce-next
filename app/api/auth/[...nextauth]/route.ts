import NextAuth, { NextAuthOptions } from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { GoogleProfile } from "next-auth/providers/google";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import dbConnect from "@/lib/db";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth credentials are not configured");
}

const globalForMongo = globalThis as unknown as {
  _nextAuthClientPromise?: Promise<MongoClient>;
};

const clientPromise =
  globalForMongo._nextAuthClientPromise ??
  (globalForMongo._nextAuthClientPromise = new MongoClient(
    process.env.MONGODB_URI,
  ).connect());

type MutableUser = (NextAuthUser | AdapterUser) & {
  role?: string | null;
  phone?: string | null;
};

type SessionUser = NextAuthUser & {
  id: string;
  role?: string | null;
  phone?: string | null;
};

const setRoleAndPhone = (target: MutableUser, role?: string | null, phone?: string | null) => {
  if (typeof role !== "undefined") {
    target.role = role ?? null;
  }
  if (typeof phone !== "undefined") {
    target.phone = phone ?? null;
  }
};

const toMutableUser = (user: NextAuthUser | AdapterUser): MutableUser => user as MutableUser;

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) throw new Error("No user found");
        if (!user.password) {
          throw new Error("Account does not support password login");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        const authUser: NextAuthUser = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role ?? "user",
        };

    toMutableUser(authUser).phone = user.phone ?? null;

        return authUser;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return true;

      if (account.provider === "google" && profile?.email) {
        await dbConnect();
        const googleProfile = profile as GoogleProfile;
        const email = googleProfile.email?.toLowerCase();
        if (!email) return true;
        const name =
          googleProfile.name ||
          `${googleProfile.given_name || ""} ${googleProfile.family_name || ""}`.trim();

        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
          const createdUser = await UserModel.create({
            name,
            email,
            role: "user",
          });
          setRoleAndPhone(toMutableUser(user), createdUser.role ?? "user", createdUser.phone ?? null);
        } else {
          if (!existingUser.name && name) {
            existingUser.name = name;
          }
          await existingUser.save();
          setRoleAndPhone(toMutableUser(user), existingUser.role ?? "user", existingUser.phone ?? null);
        }
      }

      if (account.provider === "credentials" && typeof user?.email === "string") {
        await dbConnect();
        const dbUser = await UserModel.findOne({ email: user.email.toLowerCase() });
        if (dbUser) {
          setRoleAndPhone(toMutableUser(user), dbUser.role ?? "user", dbUser.phone ?? null);
        }
      }

      return true;
    },

    async session({ session, user }) {
      if (!session.user) return session;

      if (user) {
        const mutableSessionUser = session.user as SessionUser;
        const mutableUser = toMutableUser(user);
        mutableSessionUser.id = user.id;
        mutableSessionUser.role = mutableUser.role ?? "user";
        mutableSessionUser.phone = mutableUser.phone ?? null;
        return session;
      }

      await dbConnect();
      if (typeof session.user.email === "string" && session.user.email) {
        const dbUser = await UserModel.findOne({ email: session.user.email.toLowerCase() });
        const mutableSessionUser = session.user as SessionUser;
        mutableSessionUser.role = dbUser?.role ?? mutableSessionUser.role ?? "user";
        mutableSessionUser.phone = dbUser?.phone ?? mutableSessionUser.phone ?? null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/authentication/login",
    error: "/authentication/error",
    signOut: "/",
  },

  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
