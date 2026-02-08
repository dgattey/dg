import type { Track } from '@dg/content-models/spotify/Track';

export type Colors = {
  primary: string;
  primaryContrast: string;
  primaryShadow: string;
  secondary: string;
  secondaryShadow: string;
};

/**
 * Text colors for the title/subtitle of the Spotify card
 */
const CONTRASTING_COLORS: Record<'light' | 'dark', Colors> = {
  dark: {
    primary: 'rgba(255, 255, 255, 0.7)',
    primaryContrast: 'rgba(0, 0, 0, 0.25)',
    primaryShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    secondary: 'rgba(255, 255, 255, 0.5)',
    secondaryShadow: '0 1px 3px rgba(0, 0, 0, 0.18)',
  },
  light: {
    primary: 'rgba(0, 0, 0, 0.7)',
    primaryContrast: 'rgba(255, 255, 255, 0.25)',
    primaryShadow: '0 1px 3px rgba(255, 255, 255, 0.25)',
    secondary: 'rgba(0, 0, 0, 0.5)',
    secondaryShadow: '0 1px 3px rgba(255, 255, 255, 0.18)',
  },
};

/**
 * Returns a contrasting color for the given track so the gradient background has the right contrast.
 */
export function getContrastingColors(track: Track): Colors | null {
  if (!track.albumGradientContrastSetting) {
    return null;
  }
  return CONTRASTING_COLORS[track.albumGradientContrastSetting];
}
