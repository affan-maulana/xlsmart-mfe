/**
 * Elevation tokens. The CSS variables in `globals.css` are the runtime source
 * of truth; Tailwind utilities `shadow-card` and `shadow-overlay` map to them.
 */
export const SHADOWS = {
  /** Quiet elevation for cards and panels on the page background. */
  card: 'var(--shadow-card)',
  /** Strong elevation for floating surfaces: dialogs, popovers, dropdowns. */
  overlay: 'var(--shadow-overlay)',
} as const;

export type ShadowToken = keyof typeof SHADOWS;
