import { interactiveRedesign } from '../../flags';

/**
 * Local / preview photography. Same gate as the `/` rewrite.
 */
export function isGreenhousePreview(): boolean {
  return process.env.GREENHOUSE_PREVIEW === '1' && process.env.VERCEL_ENV !== 'production';
}

/**
 * Greenhouse chrome (header bar, type scale on footer) when the flag is on
 * or when preview photography is forced.
 */
export function shouldUseGreenhouseChrome(): Promise<boolean> {
  if (isGreenhousePreview()) {
    return Promise.resolve(true);
  }
  return interactiveRedesign();
}
