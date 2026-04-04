import { Resend } from "resend";

// Validated at call time (in send functions) to avoid throwing during Next.js build
export const resend = new Resend(process.env.RESEND_API_KEY);
