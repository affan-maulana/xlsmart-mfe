/**
 * Drift check: the brand HSL triplets exported from ../colors.ts must equal
 * the `--color-*` variables declared in app/globals.css, and every hex value
 * documented in the globals.css comments must convert to the triplet above it.
 *
 * Run:  node components/design-tokens/scripts/verify-tokens.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BRAND_COLORS, BRAND_COLORS_HSL, hexToHslChannels } from '../colors.ts';

const here = dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(join(here, '../../../app/globals.css'), 'utf8');

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`✗ ${msg}`);
};

// 1. colors.ts must be internally consistent (hex ↔ HSL triplet)
for (const [name, hex] of Object.entries(BRAND_COLORS)) {
  const computed = hexToHslChannels(hex);
  const declared = BRAND_COLORS_HSL[name];
  if (computed !== declared) {
    fail(
      `colors.ts: BRAND_COLORS_HSL.${name} = "${declared}" but ${hex} converts to "${computed}"`
    );
  }
}

// 2. globals.css brand variables must equal colors.ts triplets
const cssVar = (token) =>
  globalsCss.match(new RegExp(`--color-${token}:\\s*([^;]+);`))?.[1]?.trim();
for (const [name, triplet] of Object.entries(BRAND_COLORS_HSL)) {
  const inCss = cssVar(name === 'link' ? 'link' : name);
  if (inCss !== triplet) {
    fail(`globals.css: --color-${name} = "${inCss}" but colors.ts declares "${triplet}"`);
  }
}

// 3. every raw palette line's documented hex must match its triplet
const rawBlock = globalsCss.match(/--color-white:[\s\S]*?--color-overlay:[^;]+;/)?.[0] ?? '';
for (const line of rawBlock.split('\n')) {
  const m = line.match(/--color-[\w-]+:\s*([^;]+);\s*\/\*\s*(#[0-9A-Fa-f]{6})/);
  if (!m) continue;
  const [, triplet, hex] = m;
  if (hexToHslChannels(hex) !== triplet.trim()) {
    fail(
      `globals.css: "${hex}" documented as "${triplet.trim()}" but converts to "${hexToHslChannels(hex)}"`
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} token drift issue(s) found.`);
  process.exit(1);
}
console.log('✓ design tokens in sync (colors.ts ↔ globals.css)');
