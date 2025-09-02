import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters and spaces"),

  email: z
    .email("Invalid email address"),

  // phone: z.coerce
  //   .number()
  //   .min(10000000, "Phone number must be at least 8 digits")
  //   .max(99999999999999999, "Phone number must be at most 17 digits"),

  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
    // .transform((val) => Number(val)), // 🔑 converts string → number

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});
