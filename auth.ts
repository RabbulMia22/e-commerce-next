import NextAuth from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import type { AdapterUser, AdapterAccount } from "next-auth/adapters";
import type { GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { JWT } from "next-auth/jwt";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/db";
import UserModel from "@/models/user";
import { authSecret } from "@/lib/authSecret";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;

if (!googleClientId || !googleClientSecret) {
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

const adapter = MongoDBAdapter(clientPromise);

const normalizePhone = (value?: string | null) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

type MutableUser = (NextAuthUser | AdapterUser) & {
  role?: string | null;
  phone?: string | null;
};

type SessionUser = NextAuthUser & {
  id: string;
  role?: string | null;
  phone?: string | null;
};

type ExtendedToken = JWT & {
  id?: string;
  role?: string | null;
  phone?: string | null;
};

const toMutableUser = (user: NextAuthUser | AdapterUser): MutableUser =>
  user as MutableUser;

const setRoleAndPhone = (
  target: MutableUser,
  role?: string | null,
  phone?: string | null,
) => {
  if (typeof role !== "undefined") {
    target.role = role ?? null;
  }
  if (typeof phone !== "undefined") {
    target.phone = normalizePhone(phone);
  }
};

export const authOptions = {
  adapter,
  trustHost: true,
  allowDangerousEmailAccountLinking: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawEmail = typeof credentials?.email === "string" ? credentials.email : null;
        const rawPassword =
          typeof credentials?.password === "string" ? credentials.password : null;

        if (!rawEmail || !rawPassword) {
          throw new Error("Email and password are required");
        }

        await dbConnect();
        const normalizedEmail = rawEmail.trim().toLowerCase();
        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) throw new Error("No user found");
        if (!user.password) {
          throw new Error("Account does not support password login");
        }

        const isValid = await bcrypt.compare(rawPassword, user.password);
        if (!isValid) throw new Error("Invalid password");

        const authUser: NextAuthUser = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };

  setRoleAndPhone(toMutableUser(authUser), user.role ?? "user", user.phone);

        return authUser;
      },
    }),

    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
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
          setRoleAndPhone(
            toMutableUser(user),
            createdUser.role ?? "user",
            createdUser.phone,
          );
        } else {
          if (!existingUser.name && name) {
            existingUser.name = name;
          }
          await existingUser.save();

          if (account.provider === "google" && account.providerAccountId) {
            const linkedUser = await adapter.getUserByAccount?.({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            });

            if (!linkedUser) {
              const adapterAccount: AdapterAccount = {
                userId: existingUser._id.toString(),
                type: "oauth",
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token ?? undefined,
                refresh_token: account.refresh_token ?? undefined,
                expires_at: account.expires_at ?? undefined,
                token_type: account.token_type ?? undefined,
                id_token: (account as { id_token?: string }).id_token,
                scope: account.scope ?? undefined,
              };

              await adapter.linkAccount?.(adapterAccount);
            }
          }
          setRoleAndPhone(
            toMutableUser(user),
            existingUser.role ?? "user",
            existingUser.phone,
          );
        }
      }

      if (account.provider === "credentials" && typeof user?.email === "string") {
        await dbConnect();
        const dbUser = await UserModel.findOne({ email: user.email.toLowerCase() });
        if (dbUser) {
          setRoleAndPhone(
            toMutableUser(user),
            dbUser.role ?? "user",
            dbUser.phone,
          );
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const extendedToken = token as ExtendedToken;

      if (user) {
        extendedToken.id = user.id;
        const mutableUser = toMutableUser(user);
        if (typeof mutableUser.role !== "undefined") {
          extendedToken.role = mutableUser.role ?? "user";
        }
        if (typeof mutableUser.phone !== "undefined") {
          extendedToken.phone = normalizePhone(mutableUser.phone);
        }
      }

      if (trigger === "update" && session?.user) {
        extendedToken.role = session.user.role ?? extendedToken.role ?? "user";
        const sessionPhone = normalizePhone(session.user.phone);
        if (typeof sessionPhone !== "undefined") {
          extendedToken.phone = sessionPhone;
        }
      }

      if (!extendedToken.role && extendedToken.email) {
        await dbConnect();
        const dbUser = await UserModel.findOne({ email: extendedToken.email.toLowerCase() });
        if (dbUser) {
          extendedToken.role = dbUser.role ?? "user";
          extendedToken.phone = normalizePhone(dbUser.phone);
        }
      }

      return extendedToken;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      const mutableSessionUser = session.user as SessionUser;
      const extendedToken = token as ExtendedToken;

      const tokenId = extendedToken.id ?? extendedToken.sub;
      if (tokenId) {
        mutableSessionUser.id = tokenId;
      }

      if (typeof extendedToken.role !== "undefined") {
        mutableSessionUser.role = extendedToken.role ?? "user";
      } else if (!mutableSessionUser.role) {
        mutableSessionUser.role = "user";
      }

      if (typeof extendedToken.phone !== "undefined") {
        mutableSessionUser.phone = normalizePhone(extendedToken.phone) ?? null;
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
  secret: authSecret,
  debug: process.env.NODE_ENV === "development",
} as Parameters<typeof NextAuth>[0];

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);