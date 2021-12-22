import { RequestDocument, Variables } from 'graphql-request';

/**
 * All possible GraphQL-specific API routes from /pages/api should
 * appear here.
 */
type ApiRoute = '/api/content' | '/api/github';

/**
 * Import a GraphQL client from the API server and use it directly to
 * make a request.
 */
const fetchFromServer = async <DataType, VariablesType extends Variables = never>(
  apiRoute: ApiRoute,
  query: RequestDocument,
  variables?: VariablesType | undefined,
) => {
  switch (apiRoute) {
    case '/api/content': {
      const { client } = await import('pages/api/content');
      return client.request<DataType>(query, variables);
    }
    case '/api/github': {
      const { client } = await import('pages/api/github');
      return client.request<DataType>(query, variables);
    }
  }
};

/**
 * This is used from the frontend only! Fetches GraphQL data from some API
 * route running on the NextJS backend, using a particular stringified
 * query and return type.
 */
const fetchGraphQLData = async <DataType, VariablesType extends Variables = never>(
  apiRoute: ApiRoute,
  query: RequestDocument,
  variables?: VariablesType | undefined,
): Promise<DataType | null> => {
  // On the server, fetch the API response directly with the right client
  if (!global.window) {
    return fetchFromServer(apiRoute, query, variables);
  }

  // On the client, call our API which will proxy our calls
  const response = await fetch<DataType>(apiRoute, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      // Take out extra string characters
      query: query.toString().replace(/\s\s+/g, ' '),
      variables,
    }),
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()).data;
};

export default fetchGraphQLData;
