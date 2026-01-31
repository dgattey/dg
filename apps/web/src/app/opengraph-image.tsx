import { createSocialImage } from './createSocialImage';

export const runtime = 'edge';

/**
 * Returns the Open Graph image for the homepage.
 */
export default function Image() {
  return createSocialImage('/opengraph-image');
}
