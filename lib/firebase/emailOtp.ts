/**
 * Client helpers for the email OTP verification flow. Thin wrappers around the
 * /api/auth/email-otp route. requestEmailOtp returns the demo code (if the
 * server is in demo mode) so the register screen can display it.
 */

export interface EmailOtpRequestResult {
  ok: boolean;
  delivered: boolean;
  /** Present only in demo mode (no RESEND_API_KEY). Display to the user. */
  demo?: { code: string };
  error?: string;
}

export async function requestEmailOtp(email: string): Promise<EmailOtpRequestResult> {
  const res = await fetch("/api/auth/email-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json()) as EmailOtpRequestResult;
  return { ...data, ok: res.ok && data.ok !== false };
}

/** Verify a 6-digit code. Throws an Error with a human message on failure. */
export async function verifyEmailOtp(email: string, code: string): Promise<void> {
  const res = await fetch("/api/auth/email-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = (await res.json()) as { ok: boolean; error?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Verification failed. Please try again.");
  }
}
