export type RouteMapTokens = {
  casingStroke: string;
  containerBackground: string;
  scrimGradient: string;
  tileFilter: string;
};

const creamMix = (percent: number) => `color-mix(in srgb, var(--cream) ${percent}%, transparent)`;

export function getRouteMapTokens(dark: boolean): RouteMapTokens {
  return {
    casingStroke: 'var(--cream)',
    containerBackground: 'var(--cream)',
    scrimGradient: dark
      ? 'linear-gradient(180deg, rgb(0 0 0 / 0.04) 0%, rgb(0 0 0 / 0.12) 100%)'
      : `linear-gradient(180deg, ${creamMix(6)} 0%, ${creamMix(14)} 100%)`,
    tileFilter: dark ? 'saturate(0.9)' : 'saturate(0.85) contrast(1.04)',
  };
}
