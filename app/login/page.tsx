"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, Phone, Chrome, ArrowRight, AlertCircle } from "lucide-react";
import { ConfirmationResult } from "firebase/auth";
import { useAuth, type UserRole } from "@/lib/firebase/AuthContext";
import { cx } from "@/components/ui/primitives";

type AuthMode = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, sendPhoneOTP, verifyPhoneOTP, error, clearError, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  /* ---- Email sign-in -------------------------------------------- */
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch {
      /* error is set in context */
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Google sign-in ------------------------------------------- */
  const handleGoogle = async () => {
    clearError();
    try {
      await signInWithGoogle();
      router.push("/");
    } catch {
      /* error is set in context */
    }
  };

  /* ---- Phone OTP ------------------------------------------------ */
  const handleSendOTP = async () => {
    clearError();
    setSubmitting(true);
    try {
      const result = await sendPhoneOTP(phone.replace(/\s/g, ""));
      if (result) {
        setConfirmResult(result);
        setOtpSent(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmResult) return;
    clearError();
    setSubmitting(true);
    try {
      await verifyPhoneOTP(confirmResult, otp);
      router.push("/");
    } catch {
      /* error is set in context */
    } finally {
      setSubmitting(false);
    }
  };

  // Don't block the whole page on the initial auth check — render the form
  // immediately and dim it slightly while the session resolves, so the user
  // never stares at a blank spinner wall.
  return (
    <div className={cx(
      "flex min-h-screen items-center justify-center bg-obsidian-900 px-4 transition-opacity duration-200",
      loading && "pointer-events-none opacity-50"
    )}>
      <div className="w-full max-w-[420px]">
        {/* ---- Brand ---- */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink">
            <Activity size={20} className="text-obsidian-900" />
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-[-0.03em]">
              Pulse<span className="font-normal text-ink-subtle">OS</span>
            </h1>
            <p className="mt-1 text-sm text-ink-subtle">
              Restaurant Operating Intelligence
            </p>
          </div>
        </div>

        {/* ---- Card ---- */}
        <div className="rounded-xl border border-line-soft bg-obsidian-850 p-6">
          <h2 className="mb-6 text-base font-semibold">Sign in to PulseOS</h2>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-state-riskDim px-3 py-2.5 text-sm text-state-risk">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode tabs */}
          <div className="mb-5 flex rounded-lg bg-obsidian-800 p-1">
            <button
              onClick={() => { setMode("email"); clearError(); }}
              className={cx(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "email"
                  ? "bg-obsidian-700 text-ink"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <Mail size={14} className="mr-1.5 inline" />
              Email
            </button>
            <button
              onClick={() => { setMode("phone"); clearError(); }}
              className={cx(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "phone"
                  ? "bg-obsidian-700 text-ink"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <Phone size={14} className="mr-1.5 inline" />
              Phone
              <span className="ml-1.5 rounded bg-state-busyDim px-1.5 py-0.5 text-[10px] font-bold uppercase text-state-busy">
                Beta
              </span>
            </button>
          </div>

          {/* ---- Email form ---- */}
          {mode === "email" && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@pulseos.app"
                    className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-obsidian-900 transition-all hover:bg-white active:scale-[0.985] disabled:opacity-40"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian-800 border-t-obsidian-900" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ---- Phone OTP form ---- */}
          {mode === "phone" && (
            <div className="flex flex-col gap-4">
              {/* Hackathon Judge Preset Banner */}
              <div className="rounded-lg border border-line-soft bg-obsidian-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-state-busy">
                    ⚡ Hackathon Judge Preset (Free)
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhone("+91 99999 99999")}
                    className="text-[11px] font-semibold text-ink underline hover:text-white"
                  >
                    Auto-fill +91 99999 99999
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-ink-subtle">
                  Judges can test with any number! For zero-cost testing, use OTP code <code className="rounded bg-obsidian-900 px-1 py-0.5 font-mono text-state-ok">123456</code>.
                </p>
              </div>

              {!otpSent ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-subtle">
                      Firebase SMS Auth · Works with real numbers or test numbers
                    </p>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={submitting || phone.replace(/\s/g, "").length < 10}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-obsidian-900 transition-all hover:bg-white active:scale-[0.985] disabled:opacity-40"
                  >
                    {submitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian-800 border-t-obsidian-900" />
                    ) : (
                      "Send OTP Code"
                    )}
                  </button>
                </>
              ) : (
                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 px-4 text-center text-lg font-semibold tracking-[0.3em] text-ink placeholder:text-ink-subtle/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                    />
                    <p className="mt-1.5 text-xs text-ink-subtle">
                      Enter code for {phone} (Test code: <span className="font-mono text-state-ok font-semibold">123456</span>)
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || otp.length < 6}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-obsidian-900 transition-all hover:bg-white active:scale-[0.985] disabled:opacity-40"
                  >
                    {submitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian-800 border-t-obsidian-900" />
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-sm text-ink-muted hover:text-ink"
                  >
                    ← Change number
                  </button>
                </form>
              )}
            </div>
          )}


          {/* ---- Divider ---- */}
          <div className="my-5 flex items-center gap-3">
            <span className="flex-1 border-t border-line-soft" />
            <span className="text-xs text-ink-subtle">or</span>
            <span className="flex-1 border-t border-line-soft" />
          </div>

          {/* ---- Google ---- */}
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line-soft bg-obsidian-800 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-loud hover:bg-obsidian-700"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* ---- Register link ---- */}
          <p className="mt-6 text-center text-sm text-ink-subtle">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-ink hover:underline"
            >
              Register →
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-ink-subtle/60">
          PulseOS · Restaurant Operating Intelligence Platform
        </p>
      </div>
    </div>
  );
}
