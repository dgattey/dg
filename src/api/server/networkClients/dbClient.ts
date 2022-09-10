import { PrismaClient } from '@dg/api/server/generated/';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var dbClient: PrismaClient | undefined;
}

/**
 * This database connection is used whenever we need to store/query data from
 * our distributed DB. Should only ever be used on the server! Must be using
 * a global instance otherwise we have db timeouts
 */
const dbClient =
  global.dbClient ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.dbClient = dbClient;
}

export default dbClient;
