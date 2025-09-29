import { createContext } from 'react';

/**
 * Indicates whether scroll indicators should show globally across
 * the app. Based on user scroll position past a threshold.
 */
export const ScrollIndicatorContext = createContext(false);
