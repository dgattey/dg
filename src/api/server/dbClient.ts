import { PrismaClient } from 'api/server/generated/';

/**
 * This database connection is used whenever we need to store/query data from
 * our distributed DB. Should only ever be used on the server!
 */
const dbClient = new PrismaClient();

export default dbClient;
