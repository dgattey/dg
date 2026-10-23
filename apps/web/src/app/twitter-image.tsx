import { createSocialImage, SOCIAL_IMAGE_ALTS, SOCIAL_IMAGE_SIZE } from './createSocialImage';

export const alt = SOCIAL_IMAGE_ALTS.home;
export const contentType = 'image/png';
export const size = SOCIAL_IMAGE_SIZE;

/**
 * Returns the Twitter card image for the homepage.
 */
export default function Image() {
  return createSocialImage();
}
