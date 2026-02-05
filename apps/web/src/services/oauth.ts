import 'server-only';

import { getOauthStatus as getOauthStatusImpl } from '@dg/services/oauth/getOauthStatus';

/**
 * Gets OAuth status for a provider.
 */
export const getOauthStatus = getOauthStatusImpl;
