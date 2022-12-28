import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';

/**
 * Short class names for MUI components in production, for better performance.
 */
ClassNameGenerator.configure((componentName) => componentName.replace('Mui', ''));
