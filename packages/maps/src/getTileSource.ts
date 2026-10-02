import 'server-only';

import { resolveTileSource } from './tileSource';

/** The single place map code reads tile config from the environment. */
export const getTileSource = () => resolveTileSource(process.env);
