'use client';

import { deleteWebhookSubscription } from '../../../services/strava.actions';
import { ServerActionButton } from '../ServerActionButton';

/**
 * Client component that renders a button to delete a Strava webhook subscription.
 * The subscription ID is looked up server-side for security.
 */
export function DeleteWebhookButton() {
  return (
    <ServerActionButton
      action={deleteWebhookSubscription}
      label="Delete subscription"
      loadingLabel="Deleting..."
      tiltDeg={2}
      tone="vermilion"
    />
  );
}
