import { z } from "zod";

export const placePointSchema = z.object({
  address: z.string().trim().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const routeAnalyzeSchema = z.object({
  origin: placePointSchema,
  destination: placePointSchema,
  travelMode: z.enum(["WALK", "BICYCLE"]),
  conditions: z.array(z.string()).default([]),
  familyMode: z.boolean().default(false),
});

export const aqiQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const sessionBodySchema = z.object({
  idToken: z.string().trim().min(1),
});

export const aiRecommendSchema = z
  .object({
    routeAnalysisId: z.string().optional(),
    selectedRouteId: z.string().optional(),
    routeId: z.enum(["healthy", "fastest"]).optional(),
    origin: z.string().optional(),
    destination: z.string().optional(),
    travelMode: z.enum(["WALK", "BICYCLE"]).optional(),
    language: z.literal("id").default("id"),
    conditions: z.array(z.string()).default([]),
    userContext: z
      .object({
        conditions: z.array(z.string()).default([]),
        familyMode: z.boolean().default(false),
      })
      .optional(),
  })
  .refine((value) => Boolean(value.routeId || value.selectedRouteId), {
    message: "routeId or selectedRouteId is required",
    path: ["routeId"],
  });

export type RouteAnalyzeInput = z.infer<typeof routeAnalyzeSchema>;
export type AIRecommendInput = z.infer<typeof aiRecommendSchema>;
