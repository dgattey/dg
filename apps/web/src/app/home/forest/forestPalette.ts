import type { SxObject } from '@dg/ui/theme';
import type { TerrainKind } from './forestMap';

/**
 * The island's colours as CSS custom properties.
 *
 * SVG presentation attributes get `var(--forest-*)` rather than literal colours
 * so light and dark schemes swap without re-rendering, and so the whole palette
 * lives in one place. Hues track the site's own warm/teal split: light mode is
 * a sunlit cream-and-moss island, dark mode a deep teal one at dusk.
 */
export const FOREST_COLOR_VARS: SxObject = {
  '--forest-bark': 'light-dark(hsl(24deg 34% 40%), hsl(24deg 22% 24%))',
  '--forest-bark-dark': 'light-dark(hsl(24deg 34% 30%), hsl(24deg 22% 17%))',
  '--forest-bloom': 'light-dark(hsl(340deg 70% 68%), hsl(24deg 80% 62%))',
  '--forest-bloom-alt': 'light-dark(hsl(48deg 90% 62%), hsl(48deg 70% 58%))',
  '--forest-bridge': 'light-dark(hsl(29deg 46% 54%), hsl(27deg 30% 29%))',
  '--forest-canopy': 'light-dark(hsl(126deg 32% 38%), hsl(158deg 34% 24%))',
  '--forest-canopy-cedar': 'light-dark(hsl(168deg 28% 28%), hsl(176deg 32% 18%))',
  '--forest-canopy-light': 'light-dark(hsl(112deg 38% 50%), hsl(150deg 30% 32%))',
  '--forest-canopy-maple': 'light-dark(hsl(18deg 52% 42%), hsl(18deg 40% 32%))',
  '--forest-canopy-maple-light': 'light-dark(hsl(28deg 58% 52%), hsl(24deg 44% 38%))',
  '--forest-canopy-pine': 'light-dark(hsl(150deg 34% 30%), hsl(168deg 38% 19%))',
  '--forest-canopy-pine-light': 'light-dark(hsl(146deg 36% 40%), hsl(162deg 32% 26%))',
  '--forest-clearing': 'light-dark(hsl(96deg 42% 71%), hsl(150deg 24% 25%))',
  '--forest-grass': 'light-dark(hsl(104deg 34% 62%), hsl(158deg 28% 19%))',
  '--forest-hill': 'light-dark(hsl(78deg 26% 57%), hsl(164deg 20% 25%))',
  // HUD chrome (header capsule, minimap, hint). Nearly opaque so it reads as a
  // carved board, not the old frosted glass floating over the scene.
  '--forest-hud': 'light-dark(hsl(40deg 54% 90% / 0.94), hsl(192deg 46% 12% / 0.94))',
  '--forest-hud-edge': 'light-dark(hsl(28deg 40% 46% / 0.9), hsl(28deg 30% 40% / 0.8))',
  '--forest-lake': 'light-dark(hsl(195deg 57% 51%), hsl(196deg 62% 16%))',
  // Warm lantern light that flares on the landmark the walker is standing at.
  '--forest-lantern': 'light-dark(hsl(38deg 92% 60%), hsl(30deg 92% 62%))',
  '--forest-meadow': 'light-dark(hsl(88deg 44% 68%), hsl(150deg 26% 22%))',
  '--forest-mountain': 'light-dark(hsl(28deg 14% 68%), hsl(196deg 14% 32%))',
  '--forest-mountain-cap': 'light-dark(hsl(30deg 22% 84%), hsl(196deg 16% 44%))',
  '--forest-ocean': 'light-dark(hsl(196deg 58% 58%), hsl(196deg 64% 13%))',
  '--forest-paper': 'light-dark(hsl(40deg 60% 92%), hsl(192deg 42% 15%))',
  '--forest-paper-edge': 'light-dark(hsl(36deg 44% 80%), hsl(192deg 32% 24%))',
  '--forest-path': 'light-dark(hsl(32deg 46% 72%), hsl(28deg 20% 32%))',
  '--forest-rock': 'light-dark(hsl(28deg 10% 62%), hsl(196deg 10% 38%))',
  '--forest-rock-light': 'light-dark(hsl(30deg 14% 76%), hsl(196deg 12% 48%))',
  '--forest-sand': 'light-dark(hsl(42deg 64% 82%), hsl(38deg 24% 42%))',
  '--forest-shadow': 'light-dark(hsl(140deg 24% 32% / 0.22), hsl(190deg 60% 4% / 0.42))',
  '--forest-shallow': 'light-dark(hsl(188deg 62% 72%), hsl(190deg 52% 22%))',
  '--forest-stone': 'light-dark(hsl(30deg 12% 70%), hsl(196deg 12% 34%))',
  '--forest-stone-light': 'light-dark(hsl(32deg 16% 82%), hsl(196deg 14% 46%))',
  '--forest-surf': 'light-dark(hsl(190deg 80% 92%), hsl(186deg 44% 40%))',
  '--forest-trail': 'light-dark(hsl(30deg 34% 65%), hsl(28deg 18% 27%))',
  '--forest-wetland': 'light-dark(hsl(126deg 28% 56%), hsl(174deg 30% 20%))',
  // Landmark material system — the shared "wood, paper, stone" vocabulary every
  // in-world panel is built from, so a plaque here and a future signpost on the
  // music pages read as the same terrain rather than a card pasted on top.
  '--forest-wood': 'light-dark(hsl(28deg 40% 46%), hsl(26deg 26% 26%))',
  '--forest-wood-dark': 'light-dark(hsl(24deg 40% 32%), hsl(24deg 28% 16%))',
  '--forest-wood-light': 'light-dark(hsl(32deg 48% 60%), hsl(28deg 26% 36%))',
};

type Hsl = readonly [number, number, number];

/** HSL for the terrain bitmap. Mirrors the CSS tokens so light/dark stay in lockstep. */
export const TERRAIN_HSL: Record<'dark' | 'light', Record<TerrainKind, Hsl>> = {
  dark: {
    bridge: [27, 30, 29],
    clearing: [150, 24, 25],
    grass: [158, 28, 19],
    hill: [164, 20, 25],
    lake: [196, 62, 16],
    meadow: [150, 26, 22],
    mountain: [196, 14, 32],
    ocean: [196, 64, 13],
    path: [28, 20, 32],
    sand: [38, 24, 42],
    shallow: [190, 52, 22],
    trail: [28, 18, 27],
    wetland: [174, 30, 20],
  },
  light: {
    bridge: [29, 46, 54],
    clearing: [96, 42, 71],
    grass: [104, 34, 62],
    hill: [78, 26, 57],
    lake: [195, 57, 51],
    meadow: [88, 44, 68],
    mountain: [28, 14, 68],
    ocean: [196, 58, 58],
    path: [32, 46, 72],
    sand: [42, 64, 82],
    shallow: [188, 62, 72],
    trail: [30, 34, 65],
    wetland: [126, 28, 56],
  },
};

export const TERRAIN_DETAIL_HSL: Record<
  'dark' | 'light',
  Record<'cap' | 'plank' | 'ridge', Hsl>
> = {
  dark: {
    cap: [196, 16, 44],
    plank: [24, 28, 16],
    ridge: [196, 14, 46],
  },
  light: {
    cap: [30, 22, 84],
    plank: [24, 40, 32],
    ridge: [32, 16, 82],
  },
};
