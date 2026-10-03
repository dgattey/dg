import 'server-only';

import type { OauthStatus } from '@dg/services/oauth/types';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { oauthConnectRoute } from '@dg/shared-core/routes/api';
import { Button } from '@mui/material';

export function ConnectButton({
  provider,
  status,
}: {
  provider: OauthProviderKey;
  status: OauthStatus;
}) {
  const connectHref = oauthConnectRoute(provider);
  return (
    <Button href={connectHref} size="small" variant="contained">
      {status.isConnected ? 'Reconnect' : 'Connect'}
    </Button>
  );
}
