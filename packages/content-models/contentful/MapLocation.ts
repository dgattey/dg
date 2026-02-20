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
   * Sorted zoom levels from Contentful. First = min, last = max.
   */
  zoomLevels: Array<number>;
};
