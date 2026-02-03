import { dotenvLoad } from 'dotenv-mono';
import { cliOptionsByEnv } from './dbConfig';

dotenvLoad();

export = cliOptionsByEnv;
