import { gql } from 'graphql-request';
import fetchGraphQLData from '../fetchGraphQLData';
import type { Location } from './generated/api.generated';
import type { MyLocationQuery } from './generated/fetchMyLocation.generated';

type MyLocation = Location | undefined;

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query MyLocation {
    contentTypeLocation(id: "1RWFWMUzNgSKtL7qzAJ9bz") {
      point {
        lat
        lon
      }
    }
  }
`;

/**
 * Fetches the text block corresponding to the introduction rich text
 * for the home page.
 */
const fetchMyLocation = async (): Promise<MyLocation> => {
  const data = await fetchGraphQLData<MyLocationQuery>('/api/content', QUERY);
  return data?.contentTypeLocation?.point;
};

export default fetchMyLocation;
