import type { MyLocationQuery } from 'api/types/generated/fetchContentfulLocation.generated';

/**
 * Represents a location along with some metadata
 */
export type MapLocation = Pick<
  NonNullable<MyLocationQuery['contentTypeLocation']>,
  'point' | 'initialZoom' | 'image'
> & {
  /**
   * Converts zoom levels to a number array
   */
  zoomLevels: Array<number>;
};
