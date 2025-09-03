import { z } from "zod";

export const LoginSchema = z.object({
    phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
    // .transform((val) => Number(val)), // 🔑 converts string → number
});
