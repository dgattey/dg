import type { WebhookType } from 'api/types/WebhookType';
import { command, oneOf, positional, run, string, subcommands } from 'cmd-ts';
import { formattedList } from 'helpers/formattedList';
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
    description: `The API to use for the command - has to be "${formattedList(WEBHOOK_TYPES)}"`,
  }),
};

// Tiny wrapper to create a command
const commandFrom = (name: string, handler: (type: WebhookType) => Promise<void>) =>
  command({
    name,
    args: standardArgs,
    handler: ({ webhookType }) => handler(webhookType),
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
      name: 'pnpm webhooks',
      cmds: {
        create: commandFrom('create', createSubscription),
        list: commandFrom('list', listSubscriptions),
        delete: deleteCommand,
      },
    }),
    process.argv.slice(2),
  ))();
