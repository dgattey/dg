import { isDefinedItem } from 'api/parsers';
import type { MyLocationQuery } from 'api/types/generated/fetchContentfulLocation.generated';
import type { MapLocation } from 'api/types/MapLocation';
import { MAP_MARKER_IMAGE_SIZE, PROJECT_MAX_IMAGE_DIMENSION } from 'constants/imageSizes';
import { gql } from 'graphql-request';
import { contentfulClient } from './networkClients/contentfulClient';

// To account for pixel density, we need double the size!
const IMAGE_SIZE = MAP_MARKER_IMAGE_SIZE * 2;

// The preview image is a standard project size
const PREVIEW_IMAGE_SIZE = PROJECT_MAX_IMAGE_DIMENSION * 2;

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
        url(transform: { 
          width: ${IMAGE_SIZE}, 
          height: ${IMAGE_SIZE},
          format: WEBP
        })
        width
        height
      }
    }
    lightImage: asset(id: "5PrFVu1gJBLhgJGixRL4Wc") {
      url(transform: { 
          width: ${PREVIEW_IMAGE_SIZE}, 
          height: ${PREVIEW_IMAGE_SIZE},
          quality: 80,
          format: WEBP
        })
    }
    darkImage: asset(id: "6bRgM9lkcceJQOE0jSOEfu") {
      url(transform: { 
          width: ${PREVIEW_IMAGE_SIZE}, 
          height: ${PREVIEW_IMAGE_SIZE},
          quality: 80,
          format: WEBP
        })
    }
  }
`;

/**
 * Fetches my current location from Contentful.
 */
export const fetchContentfulLocation = async (): Promise<MapLocation | null> => {
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
};
