import type { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ApiError } from "@/lib/server/errors";
import { logWarn } from "@/lib/server/logger";

export type AuthenticatedUser = {
  uid: string;
  email?: string;
  isDemo: boolean;
};

function allowDevAuth() {
  return process.env.NODE_ENV !== "production" || process.env.AIRU_ALLOW_DEV_AUTH === "true";
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser> {
  const session = request.cookies.get("__session")?.value;
  const adminAuth = getAdminAuth();

  if (adminAuth) {
    if (!session) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing session cookie");
    }

    try {
      const decoded = await adminAuth.verifySessionCookie(session, true);
      return {
        uid: decoded.uid,
        email: decoded.email,
        isDemo: false,
      };
    } catch {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid session cookie");
    }
  }

  if (allowDevAuth()) {
    logWarn("auth", "Firebase Admin is not configured; using demo backend identity");
    return {
      uid: "demo-user",
      email: "demo@airu.app",
      isDemo: true,
    };
  }

  throw new ApiError(500, "FIREBASE_ADMIN_NOT_CONFIGURED", "Firebase Admin is not configured");
}
