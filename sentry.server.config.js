// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import {
  CaptureConsole as CaptureConsoleIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  Offline as OfflineIntegration,
} from '@sentry/integrations';
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  tracesSampleRate: 1.0,

  // Sets our release value using the NEXT_PUBLIC_APP_VERSION that's generated on `yarn build`
  release: `dg@${process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown'}`,

  integrations: [
    // Rewrites console.x into messages!
    new CaptureConsoleIntegration(),

    // Captures events that happen offline and replays them when back online
    new OfflineIntegration(),

    // Adds extra non-native data on Errors to Sentry
    new ExtraErrorDataIntegration(),
  ],
});
