import { isDefinedItem } from 'api/parsers';
import type { MyLocationQuery } from 'api/types/generated/fetchContentfulLocation.generated';
import type { MapLocation } from 'api/types/MapLocation';
import { gql } from 'graphql-request';
import contentfulClient from './networkClients/contentfulClient';

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
        url
        width
        height
      }
    }
    lightImage: asset(id: "5PrFVu1gJBLhgJGixRL4Wc") {
      url
    }
    darkImage: asset(id: "6bRgM9lkcceJQOE0jSOEfu") {
      url
    }
  }
`;

/**
 * Fetches my current location from Contentful.
 */
const fetchContentfulLocation = async (): Promise<MapLocation | null> => {
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

export default fetchContentfulLocation;
