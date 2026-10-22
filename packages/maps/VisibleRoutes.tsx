'use client';

import { createContext } from 'react';

/** Ids of the routes a `RouteAtlas` below should ink, or null for all of them. */
export const VisibleRoutes = createContext<ReadonlySet<number> | null>(null);
