import authenticatedGraphQLClient from 'api/server/authenticatedGraphQLClient';
import generateHandler from 'api/server/generateHandler';

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_GITHUB_AUTHENTICATION_TOKEN;
const ENDPOINT = 'https://api.github.com/graphql';

export const client = authenticatedGraphQLClient(ENDPOINT, ACCESS_TOKEN);
const handler = generateHandler(client);

export default handler;
