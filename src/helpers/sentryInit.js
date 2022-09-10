import {
  CaptureConsole as CaptureConsoleIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
} from '@sentry/integrations';
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const IGNORED_ERROR_MESSAGES = [
  /**
   * We don't include Mapbox GL JS CSS files, but we include custom CSS that's what we
   * use to make sure our bundle size is smaller
   */
  'appears to be missing CSS declarations for Mapbox GL JS',
];

/**
 * Makes sure we have pleasant typing on our init function from Sentry
 * @type {{ init: import('@sentry/nextjs')['init']}}
 */
const { init } = Sentry;

/**
 * Initializes Sentry wherever this is called from
 */
const sentryInit = () =>
  init({
    dsn: SENTRY_DSN,

    tracesSampleRate: 1.0,

    // Always ignore localhost
    denyUrls: [/localhost/],

    // Make sure we don't enable sending events on local builds or builds where we have no real version set
    enabled:
      !'vX.Y.Z'.includes(String(process.env.NEXT_PUBLIC_APP_VERSION)) &&
      !process.env?.DATABASE_URL?.includes('127.0.0.1'),

    /**
     * Filters out certain Sentry errors we don't care about
     */
    beforeSend: (event, hint) => {
      const error = hint?.originalException;
      const errorMessage = (typeof error !== 'string' && error?.message) || undefined;
      const message = errorMessage ?? hint?.syntheticException?.message;

      // Ignore certain types of error messages
      if (
        message &&
        IGNORED_ERROR_MESSAGES.some((ignoredMessage) => message.includes(ignoredMessage))
      ) {
        return null;
      }

      return event;
    },

    integrations: [
      // Rewrites console.x into messages!
      new CaptureConsoleIntegration(),

      // Adds extra non-native data on Errors to Sentry
      new ExtraErrorDataIntegration(),
    ],
  });

export default sentryInit;
