import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const BASE_ENDPOINT = 'https://graphql.contentful.com/content/v1/spaces';

/**
 * This is the endpoint to use for requesting GraphQL data
 */
const CONTENTFUL_ENDPOINT = `${BASE_ENDPOINT}/${SPACE_ID}`;

/**
 * We use this to actually make queries
 */
const client = new GraphQLClient(CONTENTFUL_ENDPOINT, {
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

/**
 * Fetches data from Contentful, using a particular stringified query and
 * return type. Should always be called from `getStaticProps` or
 * `getStaticPaths`. May be used in a `useSWR` context too.
 */
const fetchContentfulData = async <DataType, VariablesType extends Variables = never>(
  query: RequestDocument,
  variables?: VariablesType | undefined,
  requestHeaders?: HeadersInit | undefined,
): Promise<DataType | null> => {
  try {
    return await client.request<DataType, VariablesType>(query, variables, requestHeaders);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default fetchContentfulData;
