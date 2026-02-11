'use client';
import { invariant } from '@dg/shared-core/assertions/invariant';

import { createContext, type ReactNode, useContext } from 'react';

const ServerTimeContext = createContext<number | null>(null);

type ServerTimeProviderProps = {
  /** The server-computed timestamp to use for initial render. */
  serverTime: number;
  children: ReactNode;
};

/**
 * Provides a server-computed timestamp to child components.
 * This ensures hydration matches - both server and client use the same
 * initial timestamp, avoiding Date.now() mismatches.
 */
export function ServerTimeProvider({ serverTime, children }: ServerTimeProviderProps) {
  return <ServerTimeContext.Provider value={serverTime}>{children}</ServerTimeContext.Provider>;
}

/**
 * Returns the server-computed timestamp, or null if not in a provider.
 * Components can use this for initial render to match hydration,
 * then switch to Date.now() for live updates.
 */
export function useServerTime(): number {
  const serverTime = useContext(ServerTimeContext);
  invariant(serverTime, 'ServerTimeContext not found');
  return serverTime;
}
