import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { BRAND } from '@dg/ui/theme/color';

export type RouteMapTokens = {
  casingStroke: string;
  containerBackground: string;
  routeStroke: string;
  routeStrokeWidth: number;
  scrimGradient: string;
  tileFilter: string;
};

const paperMix = (percent: number) =>
  `color-mix(in srgb, var(--mui-palette-background-paper) ${percent}%, transparent)`;

const oliveMix = (percent: number) => `color-mix(in srgb, var(--olive) ${percent}%, transparent)`;

export function getRouteMapTokens(surface: SiteSurface, dark: boolean): RouteMapTokens {
  if (surface === 'collage') {
    return {
      casingStroke: oliveMix(72),
      containerBackground: 'var(--olive)',
      routeStroke: 'var(--cream)',
      routeStrokeWidth: 3,
      scrimGradient: `linear-gradient(180deg, ${oliveMix(42)} 0%, ${oliveMix(58)} 100%)`,
      tileFilter: 'saturate(0.35) brightness(0.92) contrast(0.85) sepia(0.12)',
    };
  }

  return {
    casingStroke: dark ? 'rgb(0 0 0 / 0.42)' : paperMix(86),
    containerBackground: 'var(--mui-palette-background-paper)',
    routeStroke: BRAND.routeLine,
    routeStrokeWidth: 2.5,
    scrimGradient: `linear-gradient(180deg, ${paperMix(dark ? 10 : 20)} 0%, ${paperMix(dark ? 20 : 28)} 100%)`,
    tileFilter: dark ? 'saturate(0.85)' : 'saturate(0.5) brightness(1.1) contrast(0.76)',
  };
}
