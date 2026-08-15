import type { SxObject } from '@dg/ui/theme';
import type { TerrainKind } from './forestMap';

/**
 * The island's colours as CSS custom properties.
 *
 * SVG presentation attributes get `var(--forest-*)` rather than literal colours
 * so light and dark schemes swap without re-rendering. Light mode is an overcast
 * workshop-yard — olive, rust, slag, concrete. Dark mode is slag at dusk, not
 * neon teal. Saturation stays low on purpose; candy lime and fruit-pink are
 * not in this vocabulary.
 */
export const FOREST_COLOR_VARS: SxObject = {
  '--forest-bark': 'light-dark(hsl(26deg 14% 32%), hsl(24deg 10% 18%))',
  '--forest-bark-dark': 'light-dark(hsl(24deg 12% 22%), hsl(22deg 10% 12%))',
  '--forest-bloom': 'light-dark(hsl(22deg 22% 38%), hsl(20deg 16% 28%))',
  '--forest-bloom-alt': 'light-dark(hsl(40deg 16% 42%), hsl(36deg 12% 30%))',
  '--forest-brass': 'light-dark(hsl(38deg 28% 42%), hsl(36deg 22% 34%))',
  '--forest-bridge': 'light-dark(hsl(28deg 18% 38%), hsl(26deg 12% 22%))',
  '--forest-canopy': 'light-dark(hsl(100deg 14% 28%), hsl(110deg 10% 16%))',
  '--forest-canopy-cedar': 'light-dark(hsl(140deg 10% 22%), hsl(150deg 10% 13%))',
  '--forest-canopy-light': 'light-dark(hsl(88deg 12% 36%), hsl(98deg 8% 22%))',
  '--forest-canopy-maple': 'light-dark(hsl(22deg 24% 32%), hsl(20deg 16% 22%))',
  '--forest-canopy-maple-light': 'light-dark(hsl(28deg 20% 40%), hsl(24deg 14% 28%))',
  '--forest-canopy-pine': 'light-dark(hsl(118deg 12% 24%), hsl(132deg 10% 13%))',
  '--forest-canopy-pine-light': 'light-dark(hsl(105deg 10% 32%), hsl(120deg 8% 20%))',
  '--forest-clearing': 'light-dark(hsl(70deg 12% 48%), hsl(80deg 8% 20%))',
  '--forest-grass': 'light-dark(hsl(88deg 16% 40%), hsl(96deg 10% 16%))',
  '--forest-hill': 'light-dark(hsl(52deg 10% 44%), hsl(48deg 8% 18%))',
  '--forest-hud': 'light-dark(hsl(40deg 8% 78% / 0.94), hsl(210deg 8% 12% / 0.94))',
  '--forest-hud-edge': 'light-dark(hsl(30deg 6% 36% / 0.92), hsl(30deg 4% 28% / 0.85))',
  '--forest-lake': 'light-dark(hsl(198deg 18% 30%), hsl(204deg 16% 9%))',
  '--forest-lantern': 'light-dark(hsl(38deg 32% 44%), hsl(36deg 28% 38%))',
  '--forest-meadow': 'light-dark(hsl(78deg 14% 46%), hsl(88deg 8% 18%))',
  '--forest-mountain': 'light-dark(hsl(30deg 6% 50%), hsl(210deg 6% 22%))',
  '--forest-mountain-cap': 'light-dark(hsl(32deg 8% 62%), hsl(210deg 6% 30%))',
  '--forest-ocean': 'light-dark(hsl(200deg 16% 34%), hsl(206deg 14% 8%))',
  '--forest-paper': 'light-dark(hsl(40deg 10% 84%), hsl(210deg 6% 14%))',
  '--forest-paper-edge': 'light-dark(hsl(36deg 8% 70%), hsl(210deg 5% 22%))',
  '--forest-path': 'light-dark(hsl(32deg 14% 46%), hsl(28deg 10% 22%))',
  '--forest-rock': 'light-dark(hsl(28deg 6% 44%), hsl(210deg 4% 28%))',
  '--forest-rock-light': 'light-dark(hsl(32deg 8% 56%), hsl(210deg 5% 36%))',
  '--forest-sand': 'light-dark(hsl(36deg 16% 56%), hsl(32deg 10% 26%))',
  '--forest-shadow': 'light-dark(hsl(80deg 10% 14% / 0.42), hsl(210deg 16% 3% / 0.55))',
  '--forest-shallow': 'light-dark(hsl(196deg 14% 40%), hsl(200deg 12% 13%))',
  '--forest-steel': 'light-dark(hsl(210deg 4% 42%), hsl(210deg 4% 28%))',
  '--forest-stone': 'light-dark(hsl(32deg 5% 50%), hsl(210deg 5% 26%))',
  '--forest-stone-light': 'light-dark(hsl(36deg 6% 62%), hsl(210deg 5% 34%))',
  '--forest-surf': 'light-dark(hsl(196deg 12% 58%), hsl(200deg 10% 22%))',
  '--forest-trail': 'light-dark(hsl(28deg 12% 40%), hsl(26deg 8% 18%))',
  '--forest-wetland': 'light-dark(hsl(108deg 12% 36%), hsl(150deg 8% 14%))',
  '--forest-wood': 'light-dark(hsl(28deg 14% 34%), hsl(26deg 10% 20%))',
  '--forest-wood-dark': 'light-dark(hsl(24deg 12% 22%), hsl(22deg 10% 12%))',
  '--forest-wood-light': 'light-dark(hsl(32deg 10% 46%), hsl(28deg 8% 28%))',
};

type Hsl = readonly [number, number, number];

/** HSL for the terrain bitmap. Mirrors the CSS tokens so light/dark stay in lockstep. */
export const TERRAIN_HSL: Record<'dark' | 'light', Record<TerrainKind, Hsl>> = {
  dark: {
    bridge: [26, 12, 22],
    clearing: [80, 8, 20],
    grass: [96, 10, 16],
    hill: [48, 8, 18],
    lake: [204, 16, 9],
    meadow: [88, 8, 18],
    mountain: [210, 6, 22],
    ocean: [206, 14, 8],
    path: [28, 10, 22],
    sand: [32, 10, 26],
    shallow: [200, 12, 13],
    trail: [26, 8, 18],
    wetland: [150, 8, 14],
  },
  light: {
    bridge: [28, 18, 38],
    clearing: [70, 12, 48],
    grass: [88, 16, 40],
    hill: [52, 10, 44],
    lake: [198, 18, 30],
    meadow: [78, 14, 46],
    mountain: [30, 6, 50],
    ocean: [200, 16, 34],
    path: [32, 14, 46],
    sand: [36, 16, 56],
    shallow: [196, 14, 40],
    trail: [28, 12, 40],
    wetland: [108, 12, 36],
  },
};

export const TERRAIN_DETAIL_HSL: Record<
  'dark' | 'light',
  Record<'cap' | 'plank' | 'ridge', Hsl>
> = {
  dark: {
    cap: [210, 6, 30],
    plank: [22, 10, 12],
    ridge: [210, 5, 34],
  },
  light: {
    cap: [32, 8, 62],
    plank: [24, 12, 22],
    ridge: [36, 6, 62],
  },
};
