import { z } from "zod";

export const sampleMessageSchema = z.object({
  to: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),

  message: z
    .string()
    .min(1, "Message cannot be empty")
});
