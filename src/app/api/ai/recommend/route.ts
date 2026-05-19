import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getGeminiModel } from "@/lib/gemini";
import { buildRecommendationPrompt } from "@/lib/prompts/route-recommendation";
import { handleApiError, validationError } from "@/lib/server/errors";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { logInfo } from "@/lib/server/logger";
import { aiRecommendSchema } from "@/lib/server/validation";

function textStream(text: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function fallbackRecommendation(routeId: string) {
  return `Pilih ${routeId === "fastest" ? "rute tercepat" : "rute sehat"} jika sesuai kebutuhan perjalanan. Perhatikan label AQI per segmen dan gunakan rute sehat saat profil kamu sensitif terhadap polusi.`;
}

async function saveRecommendation(routeAnalysisId: string | undefined, userId: string, text: string) {
  if (!routeAnalysisId || routeAnalysisId.startsWith("mock-")) {
    return;
  }

  const db = getAdminDb();
  if (!db) {
    return;
  }

  const docRef = db.collection("routes").doc(routeAnalysisId);
  const snapshot = await docRef.get();
  if (!snapshot.exists || snapshot.data()?.userId !== userId) {
    return;
  }

  await docRef.set(
    {
      aiRecommendation: text,
      updatedAt: new Date(),
    },
    { merge: true },
  );
}

export async function POST(request: NextRequest) {
  const service = "ai-recommend";
  const start = Date.now();

  try {
    const user = await requireAuthenticatedUser(request);
    const parsed = aiRecommendSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const model = getGeminiModel();
    const routeId = parsed.data.routeId ?? parsed.data.selectedRouteId ?? "healthy";

    if (!model) {
      const text = fallbackRecommendation(routeId);
      await saveRecommendation(parsed.data.routeAnalysisId, user.uid, text);
      logInfo(service, "Gemini API key missing; returning fallback recommendation", {
        userId: user.uid,
        durationMs: Date.now() - start,
      });
      return new Response(textStream(text), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const prompt = buildRecommendationPrompt(parsed.data);
    const result = await model.generateContentStream(prompt);
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          await saveRecommendation(parsed.data.routeAnalysisId, user.uid, fullText);
        } finally {
          controller.close();
        }
      },
    });

    logInfo(service, "Gemini recommendation stream started", {
      userId: user.uid,
      durationMs: Date.now() - start,
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    return handleApiError(service, error);
  }
}
