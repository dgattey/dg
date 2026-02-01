import type { RenderableAsset } from './renderables/assets';

/**
 * Represents a location along with some metadata
 */
export type MapLocation = {
  /**
   * Coordinates to center the map.
   */
  point: {
    latitude: number;
    longitude: number;
  };

  /**
   * Initial zoom level for the map.
   */
  initialZoom?: number | null;

  /**
   * Optional image used for the marker.
   */
  image?: RenderableAsset | null;

  /**
   * Converts zoom levels to a number array
   */
  zoomLevels: Array<number>;

  /**
   * Dark and light mode images that should be used to show a backup
   * screenshot of the map before the MapboxGL package loads
   */
  backupImageUrls: { light: string; dark: string };
};
