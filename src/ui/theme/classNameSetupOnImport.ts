import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';

let currentHash = 0;

/**
 * Maps from a component name to its hash for lifetime of app.
 */
const HASHES: Record<string, string> = {};

/**
 * Short class names for MUI components in production, for better performance.
 */
ClassNameGenerator.configure((componentName) => {
  if (process.env.NODE_ENV !== 'production') {
    return componentName.replace('Mui', '');
  }
  const hash = HASHES[componentName] ?? currentHash.toString(36);
  if (!HASHES[componentName]) {
    currentHash += 1;
  }
  return hash;
});
