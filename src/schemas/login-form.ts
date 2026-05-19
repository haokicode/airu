import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().trim().email("Masukkan email yang valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
