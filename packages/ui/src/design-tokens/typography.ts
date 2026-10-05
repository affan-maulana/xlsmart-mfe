/**
 * Typography scale — mirrors the Tailwind `fontSize` theme in
 * `tailwind.config.ts` (Tailwind v3 requires static values at build time).
 *
 * Use these constants only when typography is needed in JS (e.g. canvas,
 * email templates, PDF generation). For styling, always prefer the Tailwind
 * utilities: `text-sm font-medium`, etc., or the semantic roles below.
 */
export const FONT_SANS = [
  'var(--font-inter)',
  '-apple-system',
  'BlinkMacSystemFont',
  "'Segoe UI'",
  'sans-serif',
];

export type TextRole =
  'display' | 'title' | 'sectionTitle' | 'body' | 'label' | 'caption' | 'micro';

export interface TypeStyle {
  /** Tailwind utility classes implementing the role. */
  className: string;
  /** Raw scale value, px / line-height px, for JS consumers. */
  fontSizePx: number;
  lineHeightPx: number;
}

export const TEXT_STYLES: Record<TextRole, TypeStyle> = {
  display: {
    className: 'text-3xl font-extrabold tracking-tight',
    fontSizePx: 30,
    lineHeightPx: 36,
  },
  title: { className: 'text-xl font-bold', fontSizePx: 20, lineHeightPx: 28 },
  sectionTitle: { className: 'text-lg font-bold', fontSizePx: 18, lineHeightPx: 28 },
  body: { className: 'text-sm', fontSizePx: 14, lineHeightPx: 20 },
  label: { className: 'text-sm font-medium', fontSizePx: 14, lineHeightPx: 20 },
  caption: { className: 'text-xs', fontSizePx: 12, lineHeightPx: 16 },
  micro: { className: 'text-[10px] leading-none', fontSizePx: 10, lineHeightPx: 10 },
};

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
