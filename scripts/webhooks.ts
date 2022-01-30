import type { WebhookType } from 'api/types/WebhookType';
import { command, oneOf, positional, run, string, subcommands } from 'cmd-ts';
import createSubscription from './helpers/createSubscription';
import deleteSubscription from './helpers/deleteSubscription';
import listSubscriptions from './helpers/listSubscriptions';

/**
 * Only Strava is supported as a subscription right now
 */
const WEBHOOK_TYPES: Array<WebhookType> = ['strava'];

// All commands take this
const standardArgs = {
  webhookType: positional({
    displayName: 'Webhook API Type',
    type: oneOf(WEBHOOK_TYPES),
    description: `The API to use for the command - has to be "${WEBHOOK_TYPES}"`,
  }),
};

// Creates a subscription
const createCommand = command({
  name: 'create',
  args: standardArgs,
  handler: ({ webhookType }) => createSubscription(webhookType),
});

// Lists all subscriptions
const listCommand = command({
  name: 'list',
  args: standardArgs,
  handler: ({ webhookType }) => listSubscriptions(webhookType),
});

// Deletes a subscription, with a given id
const deleteCommand = command({
  name: 'create',
  args: {
    ...standardArgs,
    subscriptionId: positional({
      displayName: 'Subscription ID',
      type: string,
      description: 'For deletion, this subscription id will be deleted',
    }),
  },
  handler: ({ webhookType, subscriptionId }) => deleteSubscription(webhookType, subscriptionId),
});

// Runs the parser with the three commands possible
(() =>
  run(
    subcommands({
      name: 'yarn webhooks',
      cmds: { create: createCommand, list: listCommand, delete: deleteCommand },
    }),
    process.argv.slice(2),
  ))();
