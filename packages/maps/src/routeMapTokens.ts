type RouteMapTokens = {
  background: string;
  casingStroke: string;
  scrimGradient: string;
  tileFilter: string;
};

const creamMix = (percent: number) => `color-mix(in srgb, var(--cream) ${percent}%, transparent)`;

export const ROUTE_MAP_TOKENS = {
  dark: {
    background: '#2a2a2a',
    casingStroke: 'color-mix(in srgb, var(--black) 55%, transparent)',
    scrimGradient: 'linear-gradient(180deg, rgb(0 0 0 / 0.04) 0%, rgb(0 0 0 / 0.12) 100%)',
    tileFilter: 'saturate(0.9)',
  },
  light: {
    background: 'var(--cream)',
    casingStroke: 'var(--cream)',
    scrimGradient: `linear-gradient(180deg, ${creamMix(6)} 0%, ${creamMix(14)} 100%)`,
    tileFilter: 'saturate(0.85) contrast(1.04)',
  },
} as const satisfies Record<'dark' | 'light', RouteMapTokens>;
