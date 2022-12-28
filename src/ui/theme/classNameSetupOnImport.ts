import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';

/**
 * Ensure our class names don't have the Mui prefix by default
 */
ClassNameGenerator.configure((componentName) => componentName.replace('Mui', ''));
