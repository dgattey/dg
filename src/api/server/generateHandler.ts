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
 * Proxy calls to a GraphQL client with a custom request/response to hide
 * where it's calling. Should be exported from an API file as a handler.
 */
const generateHandler =
  (client: GraphQLClient) => async (req: TypedRequest, res: NextApiResponse) => {
    const { method, body } = req;
    const { query, variables } = body ?? {};
    switch (method) {
      case 'POST': {
        if (!query) {
          res.status(500).end('Missing query');
          break;
        }
        res.json({ data: await client.request<unknown>(query, variables) });
        break;
      }
      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  };

export default generateHandler;
