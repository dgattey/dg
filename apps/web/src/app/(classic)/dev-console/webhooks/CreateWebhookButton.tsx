'use client';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { createWebhookSubscription } from '../../../../services/strava.actions';
import { ServerActionButton } from '../ServerActionButton';

/**
 * Client component that renders a button to create a Strava webhook subscription.
 */
export function CreateWebhookButton({
  surface = 'classic',
}: {
  surface?: SiteSurface;
} = {}) {
  return (
    <ServerActionButton
      action={createWebhookSubscription}
      label="Create subscription"
      loadingLabel="Creating..."
      surface={surface}
    />
  );
}
