import { z } from "zod";

export const VerifyOtpSchema = z.object({
  otp: z
  .string()
  .min(4, "OTP must be at least 4 digits")
  .regex(/^\d+$/, "OTP must contain only digits"),
});
