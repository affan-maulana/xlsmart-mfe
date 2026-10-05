/**
 * Spacing tokens.
 *
 * Tailwind v3's default 4px spacing scale is the runtime source of truth for
 * spacing — do not define parallel px constants for every step. The roles below
 * document the intentional layout decisions so the scale stays consistent
 * across MFEs. JS consumers: use these for imperative layout math only.
 */
export const SPACING_BASE_PX = 4;

export const LAYOUT_SPACING = {
  /** Standard page content padding (matches `p-5 sm:p-6`). */
  pagePadding: { base: 20, sm: 24 },
  /** Standard card/panel inner padding (matches `p-5 sm:p-6`). */
  panelPadding: { base: 20, sm: 24 },
  /** Gap between stacked panels (matches `gap-5`). */
  panelGap: 20,
  /** Gap between sibling controls in a row (matches `gap-3`). */
  controlGap: 12,
} as const;
