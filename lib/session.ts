import { auth } from "@/auth";
import { AuthError } from "next-auth";

/**
 * Safely retrieve the active session without allowing Auth.js parsing errors to bubble up.
 * Returns `null` when the session is unavailable or the response payload is malformed.
 */
export async function getSessionSafely() {
  try {
    return await auth();
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Auth session parsing failed:", error);
      return null;
    }

    throw error;
  }
}
