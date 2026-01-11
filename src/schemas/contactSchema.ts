import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[a-zA-Z0-9\s]+$/, "Name should only contain letters, numbers and spaces"),

  email: z
    .email("Invalid email address")
    .or(z.literal("")) // allow empty string
    .optional(),

  phones: z.array(z.object({
    number: z
      .string()
      .min(8, "Phone number must be at least 8 digits")
      .max(15, "Phone number must be at most 15 digits")
      .regex(/^\d+$/, "Phone number must contain only digits")
  })).min(1, "At least one phone number is required"),
  
  tags: z.array(z.string()).optional(), // ✅ NEW
});
