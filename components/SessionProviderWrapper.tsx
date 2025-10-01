"use client"; // THIS MUST be the first line

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
