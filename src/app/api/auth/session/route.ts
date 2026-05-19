import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ApiError, handleApiError, validationError } from "@/lib/server/errors";
import { logInfo } from "@/lib/server/logger";
import { sessionBodySchema } from "@/lib/server/validation";

const SESSION_MAX_AGE_SECONDS = 5 * 24 * 60 * 60;

function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set("__session", value, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set("__session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: NextRequest) {
  const service = "auth-session";

  try {
    const parsed = sessionBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const adminAuth = getAdminAuth();
    const response = new NextResponse(null, { status: 204 });

    if (adminAuth) {
      const sessionCookie = await adminAuth.createSessionCookie(parsed.data.idToken, {
        expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
      });
      setSessionCookie(response, sessionCookie);
      logInfo(service, "Firebase session cookie created");
      return response;
    }

    if (process.env.NODE_ENV === "production" && process.env.AIRU_ALLOW_DEV_AUTH !== "true") {
      throw new ApiError(500, "FIREBASE_ADMIN_NOT_CONFIGURED", "Firebase Admin is not configured");
    }

    const devCookie = `dev.${Buffer.from(parsed.data.idToken).toString("base64url").slice(0, 72)}`;
    setSessionCookie(response, devCookie);
    logInfo(service, "Development session cookie created");
    return response;
  } catch (error) {
    return handleApiError(service, error);
  }
}

export async function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookie(response);
  return response;
}
