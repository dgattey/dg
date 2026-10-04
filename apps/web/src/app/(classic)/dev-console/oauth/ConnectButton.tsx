import 'server-only';

import type { OauthStatus } from '@dg/services/oauth/types';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { oauthConnectRoute } from '@dg/shared-core/routes/api';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Button } from '@mui/material';
import { PaperButton } from '../../../collage/PaperButton';

export function ConnectButton({
  provider,
  status,
  surface = 'classic',
}: {
  provider: OauthProviderKey;
  status: OauthStatus;
  surface?: SiteSurface;
}) {
  const connectHref = oauthConnectRoute(provider);
  const label = status.isConnected ? 'Reconnect' : 'Connect';

  if (surface === 'collage') {
    return (
      <PaperButton href={connectHref} tiltDeg={-2} title={label} tone="ochre">
        {label}
      </PaperButton>
    );
  }

  return (
    <Button href={connectHref} size="small" variant="contained">
      {label}
    </Button>
  );
}
