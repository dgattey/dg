'use client';

import { createWebhookSubscription } from '../../../services/strava.actions';
import { ServerActionButton } from '../ServerActionButton';

/**
 * Client component that renders a button to create a Strava webhook subscription.
 */
export function CreateWebhookButton() {
  return (
    <ServerActionButton
      action={createWebhookSubscription}
      label="Create subscription"
      loadingLabel="Creating..."
    />
  );
}
