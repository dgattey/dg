import { command, oneOf, positional, run, string, subcommands } from 'cmd-ts';
import { formattedList } from 'shared-core/helpers/formattedList';
import { createSubscription } from './helpers/createSubscription';
import { deleteSubscription } from './helpers/deleteSubscription';
import { listSubscriptions } from './helpers/listSubscriptions';
import type { WebhookType } from './types/WebhookType';

/**
 * Only Strava is supported as a subscription right now
 */
const WEBHOOK_TYPES: Array<WebhookType> = ['strava'];

// All commands take this
const standardArgs = {
  webhookType: positional({
    description: `The API to use for the command - has to be "${formattedList(WEBHOOK_TYPES)}"`,
    displayName: 'Webhook API Type',
    type: oneOf(WEBHOOK_TYPES),
  }),
};

// Tiny wrapper to create a command
const commandFrom = (name: string, handler: (type: WebhookType) => Promise<void>) =>
  command({
    args: standardArgs,
    handler: ({ webhookType }) => handler(webhookType),
    name,
  });

// Deletes a subscription, with a given id
const deleteCommand = command({
  args: {
    ...standardArgs,
    subscriptionId: positional({
      description: 'For deletion, this subscription id will be deleted',
      displayName: 'Subscription ID',
      type: string,
    }),
  },
  handler: ({ webhookType, subscriptionId }) => deleteSubscription(webhookType, subscriptionId),
  name: 'create',
});

// Runs the parser with the three commands possible
(() =>
  run(
    subcommands({
      cmds: {
        create: commandFrom('create', createSubscription),
        delete: deleteCommand,
        list: commandFrom('list', listSubscriptions),
      },
      name: 'turbo webhook',
    }),
    process.argv.slice(2),
  ))();
