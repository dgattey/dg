import { createSocialImage, SOCIAL_IMAGE_ALTS, SOCIAL_IMAGE_SIZE } from '../createSocialImage';

export const alt = SOCIAL_IMAGE_ALTS['music-history'];
export const contentType = 'image/png';
export const size = SOCIAL_IMAGE_SIZE;

export default function Image() {
  return createSocialImage('music-history');
}
