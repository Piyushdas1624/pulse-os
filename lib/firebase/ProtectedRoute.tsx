"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/firebase/AuthContext";
import { Skeleton } from "@/components/ui/primitives";

/**
 * Client-side RBAC gate. Wrap a page's content with it:
 *
 *   <ProtectedRoute allowedRoles={["owner", "manager"]}>
 *     <PageContent />
 *   </ProtectedRoute>
 *
 * - No user          -> redirect to /login (after a short resolve window)
 * - Resolving auth   -> skeleton (never a blank spinner wall)
 * - Wrong role       -> a clear "no access" panel
 * - Role still being picked (needsRoleSelection) -> skeleton; the global
 *   RolePickerModal handles the choice
 */
export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const { user, profile, loading, needsRoleSelection } = useAuth();
  const router = useRouter();

  const role = profile?.role;
  const profileReady = !!user && !!role;
  const resolving = loading || (!!user && !profileReady) || needsRoleSelection;

  // Redirect to login once we're sure there's no user.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (resolving) {
    return (
      <div className="mx-auto max-w-[1360px] px-6 py-10 lg:px-12">
        <Skeleton widths={["40%", "70%", "55%", "80%"]} />
      </div>
    );
  }

  if (!user) {
    // Redirect is in flight; render nothing jarring meanwhile.
    return null;
  }

  if (role && !allowedRoles.includes(role)) {
    // Customers visiting staff-only pages get sent straight to the guest menu.
    if (role === "customer") {
      router.replace("/customer");
      return null;
    }
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-state-riskDim text-state-risk">
          ✕
        </span>
        <h2 className="text-lg font-semibold">No access</h2>
        <p className="text-sm text-ink-muted">
          Your role (<span className="font-medium text-ink">{role}</span>) can&apos;t
          reach this page. Switch accounts or head back to the guest menu.
        </p>
        <a
          href="/customer"
          className="mt-1 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-obsidian-900 hover:bg-white"
        >
          Open guest menu
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
