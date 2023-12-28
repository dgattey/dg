/**
 * The max widths at each breakpoint
 */
export const BREAKPOINT_MAX_SIZES = {
  extraTiny: 340,
  tiny: 576,
  small: 768,
  medium: 992,
  large: 1200,
};

/**
 * Breakpoints from min width up - same data, just remapped
 */
export const BREAKPOINTS_MIN_SIZES = {
  extraTiny: 0,
  tiny: BREAKPOINT_MAX_SIZES.extraTiny - 1,
  small: BREAKPOINT_MAX_SIZES.tiny - 1,
  medium: BREAKPOINT_MAX_SIZES.small - 1,
  large: BREAKPOINT_MAX_SIZES.medium - 1,
  extraLarge: BREAKPOINT_MAX_SIZES.large - 1,
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
  extraTiny: 340,
  tiny: 543,
  small: 510,
  medium: 297,
  large: 313.5,
  extraLarge: PROJECT_MAX_IMAGE_DIMENSION,
} as const;

/**
 * These sizes connect breakpoints with the size of a two-wide
 * project at that breakpoint.
 */
export const PROJECT_2X_IMAGE_SIZES = {
  extraTiny: 340,
  tiny: 543,
  small: 510,
  medium: 657,
  large: 693.5,
  extraLarge: 730,
} as const;
