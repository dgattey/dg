import { PSDB } from 'planetscale-node';
import type Database from 'types/db';

/**
 * This database connection is used whenever we need to store/query data from
 * our distributed DB. Should only ever be used on the server!
 */
const db: Database = new PSDB('main');
export default db;
