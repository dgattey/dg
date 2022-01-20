import { isDefinedItem } from 'api/contentful/typeguards';
import fetchGraphQLData from 'api/fetchGraphQLData';
import type { MapLocation } from 'components/maps/Map';
import { gql } from 'graphql-request';
import type { MyLocationQuery } from './generated/fetchMyLocation.generated';

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
  }
`;

/**
 * Fetches the text block corresponding to the introduction rich text
 * for the home page.
 */
const fetchMyLocation = async (): Promise<MapLocation | null> => {
  const data = await fetchGraphQLData<MyLocationQuery>('/api/content', QUERY);
  const location = data?.contentTypeLocation;
  if (!location) {
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
  };
};

export default fetchMyLocation;
