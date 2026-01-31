import { createSocialImage } from './createSocialImage';

export const runtime = 'edge';

/**
 * Returns the Twitter card image for the homepage.
 */
export default function Image() {
  return createSocialImage('/twitter-image');
}
