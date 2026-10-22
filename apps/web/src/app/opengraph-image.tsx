import { createSocialImage, SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_SIZE } from './createSocialImage';

export const alt = SOCIAL_IMAGE_ALT;
export const contentType = 'image/png';
export const size = SOCIAL_IMAGE_SIZE;

/**
 * Returns the Open Graph image for the homepage.
 */
export default function Image() {
  return createSocialImage();
}
