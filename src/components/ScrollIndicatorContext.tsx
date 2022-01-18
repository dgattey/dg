import { createContext } from 'react';

/**
 * Indicates whether the scroll indicator should show globally across
 * the app. Based on user scroll position.
 */
const ScrollIndicatorContext = createContext(false);

export default ScrollIndicatorContext;
