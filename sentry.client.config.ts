// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
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

  integrations: [
    // Rewrites console.x into messages!
    new CaptureConsoleIntegration(),

    // Captures events that happen offline and replays them when back online
    new OfflineIntegration(),

    // Adds extra non-native data on Errors to Sentry
    new ExtraErrorDataIntegration(),
  ],
});
