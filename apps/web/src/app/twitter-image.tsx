import { createSocialImage, SOCIAL_IMAGE_SIZE } from './createSocialImage';
import { HOMEPAGE_TITLE, SITE_NAME } from './metadata';

export const runtime = 'edge';
export const size = SOCIAL_IMAGE_SIZE;

/**
 * Returns the Twitter card image for the homepage.
 */
export default function Image() {
  return createSocialImage('/twitter-image', HOMEPAGE_TITLE, SITE_NAME);
}
