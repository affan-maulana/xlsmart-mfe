/**
 * XLSMART brand palette — the single raw-color source of truth.
 *
 * These are the ONLY literal hex values allowed in TypeScript. Every runtime
 * color is consumed through the semantic CSS variables declared in
 * `app/globals.css` (e.g. `var(--primary)`), never through these constants,
 * unless a value is genuinely needed in JS (canvas, gradients, non-CSS renderers).
 *
 * `BRAND_COLORS_HSL` mirrors the hex values below and MUST stay in sync with
 * the `:root` declarations in globals.css. Drift is detected by:
 *   node --experimental-strip-types components/design-tokens/scripts/verify-tokens.mjs
 *
 * MFE note: this file has zero dependencies on components, routes, or business
 * logic and can be extracted verbatim into `packages/design-tokens`.
 */
export const BRAND_COLORS = {
  /** XL signature indigo — primary actions, focus rings, active states. */
  indigo: '#1E22AA',
  /** XL signature magenta — accent, selection highlights, ::selection. */
  magenta: '#E5005A',
  /** Secondary brand purple. */
  purple: '#5B2A9D',
  /** Link/price text blue. */
  link: '#3D3AF1',
} as const;

/** Brand gradient (135deg, indigo → magenta) for signature surfaces. */
export const BRAND_GRADIENT_CSS = `linear-gradient(135deg, ${BRAND_COLORS.indigo} 0%, ${BRAND_COLORS.magenta} 100%)`;

export type BrandColorName = keyof typeof BRAND_COLORS;

/** Channel triplets (H S L, no `hsl()` wrapper) so Tailwind opacity modifiers work. */
export const BRAND_COLORS_HSL = {
  indigo: '238 70% 39%',
  magenta: '336 100% 45%',
  purple: '266 58% 39%',
  link: '241 87% 59%',
} as const satisfies Record<BrandColorName, string>;

/** Convert `#rrggbb` to the `H S L` triplet format used by the token CSS variables. */
export function hexToHslChannels(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
