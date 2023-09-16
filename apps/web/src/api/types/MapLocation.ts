import { Asset } from 'api/types/generated/contentfulApi.generated';
import type { MyLocationQuery } from 'api/types/generated/fetchCurrentLocation.generated';

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
   * Dark and light mode images that should be used to show a backup
   * screenshot of the map before the MapboxGL package loads
   */
  backupImageUrls: { light: Asset['url']; dark: Asset['url'] };
};
