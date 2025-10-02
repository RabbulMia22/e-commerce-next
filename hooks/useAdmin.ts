'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface AdminHookReturn {
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
  user: any;
}

export default function useAdmin(): AdminHookReturn {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setError("Authentication required");
      router.push("/");
      return;
    }

    if (session.user?.role !== "admin") {
      setError("Access denied - Admin privileges required");
      router.push("/");
      return;
    }

    setError(null); // User is admin
  }, [session, status, router]);

  return {
    loading: status === "loading",
    isAdmin: session?.user?.role === "admin",
    error,
    user: session?.user || null
  };
}
