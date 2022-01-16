import { GraphQLClient, Variables } from 'graphql-request';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Adds some types to the API request for the body - as every request
 * that comes through here should be a GraphQL API call, and we have
 * the `fetchGraphQLData` helper to format data on the frontend to
 * create this for us.
 */
type TypedRequest = Omit<NextApiRequest, 'body'> & {
  body: {
    /**
     * The DocumentNode or string that should be used to fetch data
     */
    query?: string;

    /**
     * If present, any variables we'd like to pass along with the
     * query.
     */
    variables?: Variables;
  };
};

/**
 * Used for processing requests into responses
 */
type Processor = (
  client: GraphQLClient,
  request: TypedRequest,
  response: NextApiResponse,
) => Promise<void>;

/**
 * For a POST request, awaits data from the client or returns a 500 if there's no
 * query specified in the body.
 */
const handlePost: Processor = async (client, request, response) => {
  const { query, variables } = request.body ?? {};
  if (!query) {
    response.status(500).end('Missing query');
    return;
  }
  response.json({ data: await client.request<unknown>(query, variables) });
};

/**
 * Processes a request and adds the right handlers
 */
const processRequest: Processor = async (client, request, response) => {
  const { method } = request;
  switch (method) {
    case 'POST': {
      await handlePost(client, request, response);
      break;
    }
    default:
      response.setHeader('Allow', ['POST']);
      response.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

/**
 * Proxy calls to a GraphQL client with a custom request/response to hide
 * where it's calling. Should be exported from an API file as a handler.
 */
const generateHandler =
  (client: GraphQLClient) => async (request: TypedRequest, response: NextApiResponse) =>
    processRequest(client, request, response);

export default generateHandler;
