/**
 * Glass surface tokens. `GlassContainer` reads the CSS variables; `:root`
 * carries today's frosted look. A parent (the greenhouse frame) can set
 * `--glass-backdrop-filter: none` and a more opaque `--glass-bg` without a
 * second component.
 */

export const GLASS_BACKDROP_FILTER_DEFAULT = 'blur(12px) saturate(150%)';

export const GLASS_BG_DEFAULT =
  'color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent)';

export const GLASS_BG_MATTE =
  'color-mix(in srgb, var(--mui-palette-background-paper) 92%, transparent)';

export function getGlassCssVars(): Record<`--${string}`, string> {
  return {
    '--glass-backdrop-filter': GLASS_BACKDROP_FILTER_DEFAULT,
    '--glass-bg': GLASS_BG_DEFAULT,
  };
}
