import { createSocialImage, SOCIAL_IMAGE_ALTS, SOCIAL_IMAGE_SIZE } from '../createSocialImage';

export const alt = SOCIAL_IMAGE_ALTS['site-map'];
export const contentType = 'image/png';
export const size = SOCIAL_IMAGE_SIZE;

export default function Image() {
  return createSocialImage('site-map');
}
