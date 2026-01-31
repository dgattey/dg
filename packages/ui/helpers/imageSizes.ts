/**
 * The max widths at each breakpoint
 */
export const BREAKPOINT_MAX_SIZES = {
  extraTiny: 340,
  large: 1200,
  medium: 992,
  small: 768,
  tiny: 576,
};

/**
 * We use this both to request data and display it on map, and we
 * have a constant size for the map marker.
 */
export const MAP_MARKER_IMAGE_SIZE = 85;

/**
 * Currently, the largest image we ever try to display for a
 * project's square image is 328x328px. This is still the max
 * dimension for a non-square image on its shorter axis.
 */
export const PROJECT_MAX_IMAGE_DIMENSION = 330;

/**
 * These sizes connect breakpoints with the standard
 * 1x image width up from that breakpoint to the next one.
 * If sizing of the project cards change, this will need to!
 */
export const PROJECT_IMAGE_SIZES = {
  extraLarge: PROJECT_MAX_IMAGE_DIMENSION,
  extraTiny: 340,
  large: 313.5,
  medium: 297,
  small: 510,
  tiny: 543,
} as const;

/**
 * These sizes connect breakpoints with the size of a two-wide
 * project at that breakpoint.
 */
export const PROJECT_2X_IMAGE_SIZES = {
  extraLarge: 730,
  extraTiny: 340,
  large: 693.5,
  medium: 657,
  small: 510,
  tiny: 543,
} as const;
