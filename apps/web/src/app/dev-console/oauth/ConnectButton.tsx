import 'server-only';

import type { OauthStatus } from '@dg/services/oauth/types';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { oauthConnectRoute } from '@dg/shared-core/routes/api';
import { PaperButton } from '../../collage/PaperButton';

export function ConnectButton({
  provider,
  status,
}: {
  provider: OauthProviderKey;
  status: OauthStatus;
}) {
  const connectHref = oauthConnectRoute(provider);
  const label = status.isConnected ? 'Reconnect' : 'Connect';

  return (
    <PaperButton href={connectHref} tiltDeg={-2} title={label} tone="ochre">
      {label}
    </PaperButton>
  );
}
