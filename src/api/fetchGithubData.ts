import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_GITHUB_AUTHENTICATION_TOKEN;
const GH_ENDPOINT = 'https://api.github.com/graphql';

/**
 * We use this to actually make queries to Github
 */
const client = new GraphQLClient(GH_ENDPOINT, {
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

/**
 * Fetches data from Github, using a particular stringified query and
 * return type. Should always be called from `getStaticProps` or
 * `getStaticPaths`. May be used in a `useSWR` context too.
 */
const fetchGithubData = async <DataType, VariablesType extends Variables = never>(
  query: RequestDocument,
  variables?: VariablesType | undefined,
  requestHeaders?: HeadersInit | undefined,
): Promise<DataType | null> =>
  client.request<DataType, VariablesType>(query, variables, requestHeaders);

export default fetchGithubData;
