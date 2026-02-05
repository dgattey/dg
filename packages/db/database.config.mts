import { dotenvLoad } from 'dotenv-mono';
import dbConfig from './dbConfig';

dotenvLoad();

export default dbConfig.cliOptionsByEnv;
