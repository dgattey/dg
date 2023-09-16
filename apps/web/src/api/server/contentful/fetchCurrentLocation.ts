import { isDefinedItem } from 'api/parsers';
import type { MyLocationQuery } from 'api/types/generated/fetchCurrentLocation.generated';
import type { MapLocation } from 'api/types/MapLocation';
import { gql } from 'graphql-request';
import { contentfulClient } from '../networkClients/contentfulClient';

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
  const location = data?.contentTypeLocation;
  if (!location || !data?.lightImage?.url || !data?.darkImage?.url) {
    return null;
  }
  const zoomLevels = location.zoomLevels?.filter(isDefinedItem)?.map(Number) ?? [];
  zoomLevels.sort((a, b) => {
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  });
  return {
    point: location.point,
    initialZoom: location.initialZoom,
    image: location.image,
    zoomLevels,
    backupImageUrls: { light: data.lightImage.url, dark: data.darkImage.url },
  };
}
