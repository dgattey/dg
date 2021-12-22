import authenticatedGraphQLClient from 'api/server/authenticatedGraphQLClient';
import generateHandler from 'api/server/generateHandler';

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const BASE_ENDPOINT = 'https://graphql.contentful.com/content/v1/spaces';
const ENDPOINT = `${BASE_ENDPOINT}/${SPACE_ID}`;

export const client = authenticatedGraphQLClient(ENDPOINT, ACCESS_TOKEN);
const handler = generateHandler(client);

export default handler;
