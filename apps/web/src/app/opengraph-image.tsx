import { createSocialImage, SOCIAL_IMAGE_SIZE } from './createSocialImage';
import { HOMEPAGE_TITLE, SITE_NAME } from './metadata';

export const runtime = 'edge';
export const size = SOCIAL_IMAGE_SIZE;

/**
 * Returns the Open Graph image for the homepage.
 */
export default function Image() {
  return createSocialImage('/opengraph-image', HOMEPAGE_TITLE, SITE_NAME);
}
