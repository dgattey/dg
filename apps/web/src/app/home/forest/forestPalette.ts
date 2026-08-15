import type { SxObject } from '@dg/ui/theme';
import type { TerrainKind } from './forestMap';

/**
 * The island's colours as CSS custom properties.
 *
 * SVG presentation attributes get `var(--forest-*)` rather than literal colours
 * so light and dark schemes swap without re-rendering. Light mode is a sunlit
 * living island — deep teal water, living greens, warm sand, meadow gold. Dark
 * mode is dusk over the same place, not slag. Candy pink berries and dirty
 * olive/rust yards are both out of this vocabulary.
 */
export const FOREST_COLOR_VARS: SxObject = {
  '--forest-bark': 'light-dark(hsl(26deg 32% 38%), hsl(24deg 22% 22%))',
  '--forest-bark-dark': 'light-dark(hsl(24deg 30% 28%), hsl(22deg 20% 14%))',
  '--forest-bloom': 'light-dark(hsl(42deg 58% 58%), hsl(38deg 40% 42%))',
  '--forest-bloom-alt': 'light-dark(hsl(48deg 52% 64%), hsl(44deg 36% 46%))',
  '--forest-brass': 'light-dark(hsl(38deg 62% 52%), hsl(36deg 42% 40%))',
  '--forest-bridge': 'light-dark(hsl(28deg 40% 48%), hsl(26deg 24% 28%))',
  '--forest-canopy': 'light-dark(hsl(132deg 42% 36%), hsl(148deg 32% 22%))',
  '--forest-canopy-cedar': 'light-dark(hsl(168deg 34% 30%), hsl(172deg 30% 18%))',
  '--forest-canopy-light': 'light-dark(hsl(118deg 46% 48%), hsl(140deg 30% 30%))',
  '--forest-canopy-maple': 'light-dark(hsl(22deg 58% 46%), hsl(20deg 40% 32%))',
  '--forest-canopy-maple-light': 'light-dark(hsl(32deg 62% 56%), hsl(28deg 42% 40%))',
  '--forest-canopy-pine': 'light-dark(hsl(152deg 40% 30%), hsl(164deg 34% 18%))',
  '--forest-canopy-pine-light': 'light-dark(hsl(146deg 42% 40%), hsl(158deg 32% 26%))',
  '--forest-clearing': 'light-dark(hsl(78deg 42% 66%), hsl(140deg 22% 24%))',
  '--forest-grass': 'light-dark(hsl(118deg 44% 48%), hsl(152deg 30% 18%))',
  '--forest-hill': 'light-dark(hsl(96deg 30% 52%), hsl(150deg 20% 22%))',
  '--forest-hud': 'light-dark(hsl(40deg 52% 93% / 0.94), hsl(196deg 36% 12% / 0.94))',
  '--forest-hud-edge': 'light-dark(hsl(28deg 38% 52% / 0.85), hsl(28deg 24% 38% / 0.8))',
  '--forest-lake': 'light-dark(hsl(188deg 58% 46%), hsl(192deg 54% 16%))',
  '--forest-lantern': 'light-dark(hsl(38deg 86% 56%), hsl(34deg 80% 54%))',
  '--forest-meadow': 'light-dark(hsl(86deg 50% 60%), hsl(142deg 26% 20%))',
  '--forest-mountain': 'light-dark(hsl(200deg 14% 60%), hsl(200deg 12% 30%))',
  '--forest-mountain-cap': 'light-dark(hsl(40deg 28% 82%), hsl(196deg 14% 42%))',
  '--forest-ocean': 'light-dark(hsl(192deg 62% 50%), hsl(198deg 58% 12%))',
  '--forest-paper': 'light-dark(hsl(40deg 56% 94%), hsl(196deg 34% 14%))',
  '--forest-paper-edge': 'light-dark(hsl(36deg 40% 82%), hsl(196deg 24% 24%))',
  '--forest-path': 'light-dark(hsl(36deg 44% 68%), hsl(30deg 18% 30%))',
  '--forest-rock': 'light-dark(hsl(210deg 10% 62%), hsl(200deg 8% 36%))',
  '--forest-rock-light': 'light-dark(hsl(40deg 16% 78%), hsl(200deg 10% 46%))',
  '--forest-sand': 'light-dark(hsl(42deg 58% 76%), hsl(36deg 22% 38%))',
  '--forest-shadow': 'light-dark(hsl(140deg 22% 28% / 0.22), hsl(196deg 50% 4% / 0.4))',
  '--forest-shallow': 'light-dark(hsl(184deg 52% 64%), hsl(190deg 44% 20%))',
  '--forest-steel': 'light-dark(hsl(28deg 28% 48%), hsl(26deg 16% 30%))',
  '--forest-stone': 'light-dark(hsl(36deg 14% 68%), hsl(200deg 10% 32%))',
  '--forest-stone-light': 'light-dark(hsl(40deg 18% 80%), hsl(200deg 12% 44%))',
  '--forest-surf': 'light-dark(hsl(186deg 70% 86%), hsl(188deg 40% 36%))',
  '--forest-trail': 'light-dark(hsl(32deg 38% 58%), hsl(28deg 16% 26%))',
  '--forest-wetland': 'light-dark(hsl(150deg 34% 44%), hsl(168deg 28% 18%))',
  '--forest-wood': 'light-dark(hsl(28deg 42% 46%), hsl(26deg 24% 26%))',
  '--forest-wood-dark': 'light-dark(hsl(24deg 40% 32%), hsl(24deg 26% 16%))',
  '--forest-wood-light': 'light-dark(hsl(32deg 48% 60%), hsl(28deg 24% 36%))',
};

type Hsl = readonly [number, number, number];

/** HSL for the terrain bitmap. Mirrors the CSS tokens so light/dark stay in lockstep. */
export const TERRAIN_HSL: Record<'dark' | 'light', Record<TerrainKind, Hsl>> = {
  dark: {
    bridge: [26, 24, 28],
    clearing: [140, 22, 24],
    grass: [152, 30, 18],
    hill: [150, 20, 22],
    lake: [192, 54, 16],
    meadow: [142, 26, 20],
    mountain: [200, 12, 30],
    ocean: [198, 58, 12],
    path: [30, 18, 30],
    sand: [36, 22, 38],
    shallow: [190, 44, 20],
    trail: [28, 16, 26],
    wetland: [168, 28, 18],
  },
  light: {
    bridge: [28, 40, 48],
    clearing: [78, 42, 66],
    grass: [118, 44, 48],
    hill: [96, 30, 52],
    lake: [188, 58, 46],
    meadow: [86, 50, 60],
    mountain: [200, 14, 60],
    ocean: [192, 62, 50],
    path: [36, 44, 68],
    sand: [42, 58, 76],
    shallow: [184, 52, 64],
    trail: [32, 38, 58],
    wetland: [150, 34, 44],
  },
};

export const TERRAIN_DETAIL_HSL: Record<
  'dark' | 'light',
  Record<'cap' | 'plank' | 'ridge', Hsl>
> = {
  dark: {
    cap: [196, 14, 42],
    plank: [24, 26, 16],
    ridge: [200, 12, 44],
  },
  light: {
    cap: [40, 28, 82],
    plank: [24, 40, 32],
    ridge: [40, 18, 80],
  },
};
