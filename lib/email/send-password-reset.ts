import { resend } from "@/lib/email/resend";
import { ResetPasswordEmail } from "@/emails/reset-password-email";

export async function sendPasswordResetEmail(
  email: string,
  otp: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY environment variable is not set");
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL environment variable is not set");
  const { error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Reset your 1Another password",
    react: ResetPasswordEmail({ otp }),
  });

  if (error) {
    throw new Error("Failed to send password reset email");
  }
}
