"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Mail,
  Lock,
  User,
  Phone,
  ChevronDown,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth, type UserRole } from "@/lib/firebase/AuthContext";
import { requestEmailOtp, verifyEmailOtp } from "@/lib/firebase/emailOtp";
import { cx } from "@/components/ui/primitives";

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full access to all operations" },
  { value: "manager", label: "Manager", description: "Manage staff, orders, and operations" },
  { value: "kitchen_staff", label: "Kitchen Staff", description: "View orders and kitchen queue" },
  { value: "customer", label: "Customer", description: "Browse menu and place orders" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [phoneNum, setPhoneNum] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Email OTP verification flow: "form" → "verify" → (account created)
  const [otpStep, setOtpStep] = useState<"form" | "verify">("form");
  const [otpCode, setOtpCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);

  /** Phase 1: validate the form, then send a verification code. */
  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestEmailOtp(email);
      if (!result.ok) {
        setLocalError(result.error || "Could not send a verification code.");
        return;
      }
      setDemoCode(result.delivered ? null : result.demo?.code ?? null);
      setOtpStep("verify");
    } catch {
      setLocalError("Could not send a verification code. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Phase 2: verify the code, then create the account. */
  const handleVerifyAndCreate = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (otpCode.trim().length !== 6) {
      setLocalError("Enter the 6-digit code we sent to your email.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmailOtp(email, otpCode.trim());
      await signUpWithEmail(email, password, name, role, phoneNum || undefined);
      router.push("/");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Verification or signup failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const backToForm = () => {
    setOtpStep("form");
    setOtpCode("");
    setLocalError(null);
  };

  const handleGoogle = async () => {
    clearError();
    try {
      await signInWithGoogle();
      router.push("/");
    } catch {
      /* error is set in context */
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-900 px-4 py-8">
      <div className="w-full max-w-[440px]">
        {/* ---- Brand ---- */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink">
            <Activity size={20} className="text-obsidian-900" />
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-[-0.03em]">
              Pulse<span className="font-normal text-ink-subtle">OS</span>
            </h1>
            <p className="mt-1 text-sm text-ink-subtle">
              Create your account
            </p>
          </div>
        </div>

        {/* ---- Card ---- */}
        <div className="rounded-xl border border-line-soft bg-obsidian-850 p-6">
          <h2 className="mb-6 text-base font-semibold">
            {otpStep === "verify" ? "Verify your email" : "Register"}
          </h2>

          {/* Error banner */}
          {displayError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-state-riskDim px-3 py-2.5 text-sm text-state-risk">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Demo-mode OTP banner (pratfall effect: transparency builds trust) */}
          {otpStep === "verify" && demoCode && (
            <div className="mb-4 rounded-lg bg-state-busyDim px-3 py-2.5 text-sm text-state-busy">
              <p className="font-semibold">Demo mode — email not configured</p>
              <p className="mt-0.5 text-ink-muted">
                Your verification code is{" "}
                <span className="font-mono text-base font-bold tracking-[0.2em] text-ink">
                  {demoCode}
                </span>
              </p>
            </div>
          )}

          {otpStep === "form" ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Chen"
                    className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Phone (optional) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Phone Number <span className="normal-case text-ink-subtle/50">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  <input
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full appearance-none rounded-lg border border-line-soft bg-obsidian-800 py-2.5 pl-4 pr-10 text-sm text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} — {r.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                </div>
              </div>

              {/* Password */}
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cx(
                        "w-full rounded-lg border bg-obsidian-800 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle/50 focus:outline-none focus:ring-1",
                        confirmPassword && confirmPassword !== password
                          ? "border-state-risk focus:border-state-risk focus:ring-state-risk/30"
                          : "border-line-soft focus:border-ink focus:ring-ink/30"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Submit → send code */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-obsidian-900 transition-all hover:bg-white active:scale-[0.985] disabled:opacity-40"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian-800 border-t-obsidian-900" />
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndCreate} className="flex flex-col gap-4">
              <p className="text-sm text-ink-muted">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-ink">{email}</span>. Enter it
                below to finish creating your account.
              </p>

              {/* OTP input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-lg border border-line-soft bg-obsidian-800 py-2.5 px-4 text-center font-mono text-lg tracking-[0.4em] text-ink placeholder:text-ink-subtle/40 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/30"
                />
              </div>

              {/* Verify & create */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-obsidian-900 transition-all hover:bg-white active:scale-[0.985] disabled:opacity-40"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian-800 border-t-obsidian-900" />
                ) : (
                  <>
                    Verify &amp; Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={backToForm}
                className="text-sm text-ink-subtle hover:text-ink"
              >
                ← Use a different email
              </button>
            </form>
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

          {/* ---- Login link ---- */}
          <p className="mt-6 text-center text-sm text-ink-subtle">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-ink hover:underline"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
