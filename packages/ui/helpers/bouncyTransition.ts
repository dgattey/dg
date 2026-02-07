import { createTransition, EASING_BOUNCY, EASING_DEFAULT, TIMING_BOUNCY } from './timing';

export function createBouncyTransition(
  properties: string | Array<string>,
  duration = TIMING_BOUNCY,
  easing = EASING_DEFAULT,
) {
  return {
    transition: createTransition(properties, duration, easing),
    transitionTimingFunction: EASING_BOUNCY,
  };
}
