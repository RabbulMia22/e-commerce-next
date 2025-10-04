import { randomBytes } from "crypto";

const globalForAuth = globalThis as {
  __AUTH_SECRET__?: string;
};

const resolvedSecret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? (globalForAuth.__AUTH_SECRET__ ??= randomBytes(32).toString("hex"))
    : undefined);

if (!resolvedSecret) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET && process.env.NODE_ENV !== "production") {
  console.warn("[auth] NEXTAUTH_SECRET is not set. Generated a temporary secret for development.");
}

export const authSecret = resolvedSecret;
