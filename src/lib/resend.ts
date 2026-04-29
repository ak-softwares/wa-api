import { Resend } from "resend";

let _resend: Resend | null = null;

export const getResend = (): Resend => {
  if (_resend) return _resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing env var: RESEND_API_KEY");

  _resend = new Resend(apiKey);
  return _resend;
};