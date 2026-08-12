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
  '--forest-canopy': 'light-dark(hsl(126deg 32% 38%), hsl(158deg 34% 24%))',
  '--forest-canopy-light': 'light-dark(hsl(112deg 38% 50%), hsl(150deg 30% 32%))',
  '--forest-canopy-pine': 'light-dark(hsl(150deg 34% 30%), hsl(168deg 38% 19%))',
  '--forest-canopy-pine-light': 'light-dark(hsl(146deg 36% 40%), hsl(162deg 32% 26%))',
  '--forest-clearing': 'light-dark(hsl(96deg 42% 71%), hsl(150deg 24% 25%))',
  '--forest-grass': 'light-dark(hsl(104deg 34% 62%), hsl(158deg 28% 19%))',
  // HUD chrome (header capsule, minimap, hint). Nearly opaque so it reads as a
  // carved board, not the old frosted glass floating over the scene.
  '--forest-hud': 'light-dark(hsl(40deg 54% 90% / 0.94), hsl(192deg 46% 12% / 0.94))',
  '--forest-hud-edge': 'light-dark(hsl(28deg 40% 46% / 0.9), hsl(28deg 30% 40% / 0.8))',
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
  // Landmark material system — the shared "wood, paper, stone" vocabulary every
  // in-world panel is built from, so a plaque here and a future signpost on the
  // music pages read as the same terrain rather than a card pasted on top.
  '--forest-wood': 'light-dark(hsl(28deg 40% 46%), hsl(26deg 26% 26%))',
  '--forest-wood-dark': 'light-dark(hsl(24deg 40% 32%), hsl(24deg 28% 16%))',
  '--forest-wood-light': 'light-dark(hsl(32deg 48% 60%), hsl(28deg 26% 36%))',
};

export const TERRAIN_FILL: Record<TerrainKind, string> = {
  clearing: 'var(--forest-clearing)',
  grass: 'var(--forest-grass)',
  meadow: 'var(--forest-meadow)',
  mountain: 'var(--forest-mountain)',
  ocean: 'var(--forest-ocean)',
  path: 'var(--forest-path)',
  sand: 'var(--forest-sand)',
  shallow: 'var(--forest-shallow)',
};
