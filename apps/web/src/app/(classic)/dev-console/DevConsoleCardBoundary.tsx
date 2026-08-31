'use client';

import { Component, type ReactNode } from 'react';
import { ErrorMessage } from './StatusIndicators';

type DevConsoleCardBoundaryProps = {
  children: ReactNode;
};

type DevConsoleCardBoundaryState = {
  digest: string | null;
  hasError: boolean;
};

/**
 * Keeps one failing card from taking down the whole console. Cards fetch from
 * third-party APIs and the database, so an unhandled failure in any of them
 * would otherwise bubble to the route's error boundary and return a 500 for a
 * page whose other cards still work.
 */
// biome-ignore lint/style/useReactFunctionComponents: error boundaries are class components
export class DevConsoleCardBoundary extends Component<
  DevConsoleCardBoundaryProps,
  DevConsoleCardBoundaryState
> {
  state: DevConsoleCardBoundaryState = { digest: null, hasError: false };

  static getDerivedStateFromError(error: unknown): DevConsoleCardBoundaryState {
    const digest =
      error && typeof error === 'object' && 'digest' in error ? String(error.digest) : null;
    return { digest, hasError: true };
  }

  render() {
    const { digest, hasError } = this.state;
    if (!hasError) {
      return this.props.children;
    }

    // The digest is the only handle on the server-side log line in production.
    const suffix = digest ? ` (digest ${digest})` : '';
    return <ErrorMessage message={`This card failed to load${suffix}. Check the server logs.`} />;
  }
}
