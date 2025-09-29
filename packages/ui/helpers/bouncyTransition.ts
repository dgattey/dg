import type { Theme } from '@mui/material/styles';

const BOUNCY_TIMING_FUNCTION =
  'linear(0, 0.205 2.1%, 0.822 6.8%, 1.073 9.1%, 1.256 11.6%, 1.308, 1.333 14.1%, 1.337,1.333 15.6%, 1.303 17.2%, 0.98 25.6%, 0.921 28.1%, 0.905, 0.896 30.6%,0.895 32.1%, 0.905 33.8%, 1.006 42.2%, 1.024, 1.033 47.1%, 1.03 50.5%,0.999 58.8%, 0.99 63.5%, 1.003 79.6%, 1)';

/**
 * Creates a bouncy transition with the specified properties and duration
 */
export function bouncyTransition(
  theme: Theme,
  properties: string | Array<string>,
  duration = 1000,
) {
  return {
    transition: theme.transitions.create(properties, { duration }),
    transitionTimingFunction: BOUNCY_TIMING_FUNCTION,
  };
}
