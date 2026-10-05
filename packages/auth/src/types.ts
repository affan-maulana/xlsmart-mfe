/**
 * Shared contract models for the platform session and navigation.
 *
 * Business-neutral by design: identity shape and navigation entries only.
 * Domain data, UI components and business rules stay in their own packages
 * and applications.
 */

/** The user shape the auth service returns from GET /auth/api/session. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * A session user extended with the business-neutral staff metadata every
 * application's chrome needs. Fields arrive from the identity service as it
 * grows; until then `mapSessionUser` fills the shared placeholders so no
 * application hardcodes staff identifiers.
 */
export interface SessionUser extends User {
  staffId?: string;
  branchCode?: string;
  locationName?: string;
  permissions?: string[];
}

/**
 * Typed outcome of a session lookup. "unavailable" is distinct from
 * "anonymous" on purpose: an identity-service outage must not be presented
 * as a signed-out user.
 */
export type SessionResult =
  | { status: "authenticated"; user: SessionUser }
  | { status: "anonymous" }
  | { status: "unavailable" };

/** Icon names the shared sidebar maps to glyphs; navigation metadata only. */
export type NavIconName =
  | "layout-dashboard"
  | "users"
  | "list-checks"
  | "arrow-left-right"
  | "bar-chart"
  | "settings";

/** One entry inside a parent navigation item's floating submenu. */
export interface NavChildItem {
  id: string;
  label: string;
  href: string;
  /** Path prefix used to decide which child is active; defaults to href. */
  match?: string;
}

/** One navigation entry rendered by the shared sidebar. */
export interface NavItem {
  id: string;
  label: string;
  /** Navigation target; "#" marks a placeholder item with no destination yet. */
  href: string;
  icon: NavIconName;
  /** Path prefix used to decide which item is active; defaults to href. */
  match?: string;
  /** Optional submenu revealed as a floating panel on hover in the overlay menu. */
  children?: ReadonlyArray<NavChildItem>;
}
