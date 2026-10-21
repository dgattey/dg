'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { ErrorMessage } from './StatusIndicators';

function CardFailed(_props: object, { error }: ErrorInfo) {
  const digest =
    error && typeof error === 'object' && 'digest' in error ? String(error.digest) : null;
  const suffix = digest ? ` (digest ${digest})` : '';
  return <ErrorMessage message={`This card failed to load${suffix}. Check the server logs.`} />;
}

/**
 * Keeps one failing card from taking down the whole console. Cards fetch from
 * third-party APIs and the database, so an unhandled failure in any of them
 * would otherwise bubble to the route's error boundary and return a 500 for a
 * page whose other cards still work.
 */
export const DevConsoleCardBoundary = catchError(CardFailed);
