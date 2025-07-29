import { gql } from 'graphql-request';
import { isNotNullish } from 'shared-core/helpers/typeguards';
import { contentfulClient } from './contentfulClient';
import type { MyLocationQuery } from './fetchCurrentLocation.generated';
import type { MapLocation } from './MapLocation';

/**
 * Grabs the home location using a known id for it
 */
const QUERY = gql`
  query MyLocation {
    contentTypeLocation(id: "1RWFWMUzNgSKtL7qzAJ9bz") {
      point {
        latitude: lat
        longitude: lon
      }
      initialZoom
      zoomLevels
      image {
        url(
          transform: {
            width: 170 # MAP_MARKER_IMAGE_SIZE * 2
            height: 170 # MAP_MARKER_IMAGE_SIZE * 2
            format: WEBP
          }
        )
        width
        height
      }
    }
    lightImage: asset(id: "5PrFVu1gJBLhgJGixRL4Wc") {
      url(
        transform: {
          width: 660 # PROJECT_MAX_IMAGE_DIMENSION * 2
          height: 660 # PROJECT_MAX_IMAGE_DIMENSION * 2
          quality: 80
          format: WEBP
        }
      )
    }
    darkImage: asset(id: "6bRgM9lkcceJQOE0jSOEfu") {
      url(
        transform: {
          width: 660 # PROJECT_MAX_IMAGE_DIMENSION * 2
          height: 660 # PROJECT_MAX_IMAGE_DIMENSION * 2
          quality: 80
          format: WEBP
        }
      )
    }
  }
`;

/**
 * Fetches my current location from Contentful.
 */
export async function fetchCurrentLocation(): Promise<MapLocation | null> {
  const data = await contentfulClient.request<MyLocationQuery>(QUERY);
  const location = data.contentTypeLocation;
  if (!location || !data.lightImage?.url || !data.darkImage?.url) {
    return null;
  }
  const zoomLevels = location.zoomLevels?.filter(isNotNullish).map(Number) ?? [];
  zoomLevels.sort((a, b) => {
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  });
  return {
    backupImageUrls: { dark: data.darkImage.url, light: data.lightImage.url },
    image: location.image,
    initialZoom: location.initialZoom,
    point: location.point,
    zoomLevels,
  };
}
