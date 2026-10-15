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

const creamMix = (percent: number) => `color-mix(in srgb, var(--cream) ${percent}%, transparent)`;

export function getRouteMapTokens(surface: SiteSurface, dark: boolean): RouteMapTokens {
  if (surface === 'collage') {
    // A printed map matted on cream paper: the host backs its own copy, so the
    // basemap stays near full strength and the route reads as a cut red line.
    return {
      casingStroke: 'var(--cream)',
      containerBackground: 'var(--cream)',
      routeStroke: 'var(--vermilion)',
      routeStrokeWidth: 3.5,
      scrimGradient: dark
        ? 'linear-gradient(180deg, rgb(0 0 0 / 0.04) 0%, rgb(0 0 0 / 0.12) 100%)'
        : `linear-gradient(180deg, ${creamMix(6)} 0%, ${creamMix(14)} 100%)`,
      tileFilter: dark ? 'saturate(0.9)' : 'saturate(0.85) contrast(1.04)',
    };
  }

  return {
    casingStroke: dark ? 'rgb(0 0 0 / 0.42)' : paperMix(86),
    containerBackground: 'var(--mui-palette-background-paper)',
    routeStroke: BRAND.routeLine,
    routeStrokeWidth: 2.5,
    scrimGradient: `linear-gradient(180deg, ${paperMix(dark ? 10 : 20)} 0%, ${paperMix(dark ? 20 : 28)} 100%)`,
    // Outdoors is vivid and fully labelled, so light mode also lifts its darkest
    // ink — road casings and place labels — toward the landcover. Without that the
    // basemap's own labels, not the route, become the worst thing under the copy.
    tileFilter: dark ? 'saturate(0.85)' : 'saturate(0.5) brightness(1.1) contrast(0.76)',
  };
}
