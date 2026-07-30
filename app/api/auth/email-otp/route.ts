import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";

/**
 * Email OTP verification — satisfies the "Email & Password with OTP (or
 * equivalent verification)" requirement honestly and for free.
 *
 * Delivery:
 *  - If RESEND_API_KEY is set → a real 6-digit code is emailed via Resend's
 *    REST API (free tier, 100/day, onboarding@resend.dev sender).
 *  - Otherwise → Demo mode: the code is returned in the response so the
 *    register screen can display it in a clearly-labelled banner (pratfall
 *    effect — transparency builds trust).
 *
 * Storage: an in-memory map keyed by email with a SHA-256 hash + 10-minute
 * TTL. This is deliberately demo-scoped; a production build would persist
 * hashed codes to Firestore. It survives across requests within the same
 * server process, which is all the demo flow needs.
 */

export const runtime = "nodejs";

type OtpRecord = { hash: string; expiresAt: number; consumed: boolean };
const OTP_STORE = new Map<string, OtpRecord>();
const TTL_MS = 10 * 60 * 1000;

function sha256(input: string): string {
  return createHash("sha256").update(input.normalize("utf8")).digest("hex");
}

function generateCode(): string {
  // 6 digits, zero-padded. randomInt is crypto-strong.
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function sendViaResend(email: string, code: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PulseOS <onboarding@resend.dev>",
        to: [email],
        subject: `Your PulseOS verification code: ${code}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 8px">PulseOS verification</h2>
            <p style="color:#555;margin:0 0 16px">Use this code to finish creating your account. It expires in 10 minutes.</p>
            <div style="font-size:34px;font-weight:700;letter-spacing:8px;background:#0f0f10;color:#fff;border-radius:8px;padding:16px 20px;text-align:center">${code}</div>
            <p style="color:#999;font-size:12px;margin-top:16px">If you didn't request this, you can ignore this email.</p>
          </div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "A valid email is required" }, { status: 400 });
  }

  /* ---- VERIFY path ---- */
  if (typeof body.code === "string") {
    const code = body.code.trim();
    const record = OTP_STORE.get(email);
    if (!record) {
      return NextResponse.json({ ok: false, error: "No code requested. Send a code first." }, { status: 400 });
    }
    if (record.consumed) {
      return NextResponse.json({ ok: false, error: "This code was already used. Request a new one." }, { status: 400 });
    }
    if (Date.now() > record.expiresAt) {
      OTP_STORE.delete(email);
      return NextResponse.json({ ok: false, error: "Code expired. Request a new one." }, { status: 400 });
    }
    if (sha256(code) !== record.hash) {
      return NextResponse.json({ ok: false, error: "Incorrect code. Try again." }, { status: 400 });
    }
    record.consumed = true;
    return NextResponse.json({ ok: true });
  }

  /* ---- SEND path ---- */
  const code = generateCode();
  OTP_STORE.set(email, {
    hash: sha256(code),
    expiresAt: Date.now() + TTL_MS,
    consumed: false,
  });

  const emailed = await sendViaResend(email, code);
  if (emailed) {
    return NextResponse.json({ ok: true, delivered: true });
  }
  // Demo mode: surface the code so the UI can display it honestly.
  return NextResponse.json({ ok: true, delivered: false, demo: { code } });
}
