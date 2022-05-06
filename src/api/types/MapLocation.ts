import { Asset } from 'api/types/generated/contentfulApi.generated';
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

  /**
   * An image that should be used to show a backup image before
   * the MapboxGL package loads
   */
  backupImageUrl: Asset['url'];
};
