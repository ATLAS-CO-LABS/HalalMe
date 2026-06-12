import { authService } from "@/services/authService";
import { merchantService } from "@/services/merchantService";

/**
 * Decides where to send a user immediately after they authenticate.
 *
 * One account can be a customer, a merchant, or both — and merchant-first
 * accounts have no username until they complete the customer profile. The
 * destination therefore depends on (does a merchant row exist?) × (is the
 * customer profile set up?), not on how they happened to log in:
 *
 *   merchant + no username → /merchant      (merchant-first; don't force the
 *                                            customer profile on them — /merchant
 *                                            isn't behind the username gate)
 *   no username            → /dashboard     (AuthGuard then routes to
 *                                            /complete-profile)
 *   otherwise              → /dashboard      (full customer; Restaurant switcher
 *                                            is shown if they're also a merchant)
 *
 * An explicit, safe `redirect` (a path the user was trying to reach) always
 * wins — the destination's own guard handles any profile gating.
 */
export async function resolvePostLoginDestination(
  redirect?: string | null,
): Promise<string> {
  if (redirect && redirect.startsWith("/")) return redirect;

  try {
    const [merchant, profile] = await Promise.all([
      merchantService.getMyMerchant(),
      authService.refreshUser(),
    ]);
    if (merchant && !profile?.username) return "/merchant";
  } catch {
    // Fall through to the dashboard; AuthGuard re-checks auth/profile state.
  }

  return "/dashboard";
}
