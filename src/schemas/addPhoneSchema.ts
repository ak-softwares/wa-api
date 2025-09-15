import { z } from "zod";

export const addPhoneSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[a-zA-Z0-9\s]+$/, "Name should only contain letters, numbers and spaces"),

  email: z
    .email("Invalid email address")
    .or(z.literal("")) // allow empty string
    .optional(),

  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
    // .transform((val) => Number(val)), // 🔑 converts string → number

});
