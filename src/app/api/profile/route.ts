import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { handleApiError, jsonOk, validationError } from "@/lib/server/errors";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { logInfo } from "@/lib/server/logger";
import { z } from "zod";

const profileSchema = z.object({
  travelMode: z.enum(["WALK", "BICYCLE"]),
  conditions: z.array(z.string()),
  familyMode: z.boolean(),
  alertAQIThreshold: z.number(),
});

export async function GET(request: NextRequest) {
  const service = "profile-get";
  try {
    const user = await requireAuthenticatedUser(request);
    const db = getAdminDb();
    if (!db) return jsonOk({});

    const doc = await db.collection("users").doc(user.uid).get();
    return jsonOk(doc.data() || {});
  } catch (error) {
    return handleApiError(service, error);
  }
}

export async function POST(request: NextRequest) {
  const service = "profile-update";
  try {
    const user = await requireAuthenticatedUser(request);
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const db = getAdminDb();
    if (db) {
      await db.collection("users").doc(user.uid).set({
        ...parsed.data,
        email: user.email,
        updatedAt: new Date(),
      }, { merge: true });
    }

    logInfo(service, "User profile updated", { userId: user.uid });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(service, error);
  }
}
