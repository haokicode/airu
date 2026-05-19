import { z } from "zod";

const placeSchema = z.object({
  address: z.string().trim().min(3, "Masukkan lokasi minimal 3 karakter"),
  lat: z.number().finite("Koordinat lokasi belum valid"),
  lng: z.number().finite("Koordinat lokasi belum valid"),
});

export const routeFormSchema = z.object({
  origin: placeSchema,
  destination: placeSchema,
  travelMode: z.enum(["WALK", "BICYCLE"]),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;
