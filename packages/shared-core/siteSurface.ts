export const SITE_SURFACES = ['classic', 'collage'] as const;

export type SiteSurface = (typeof SITE_SURFACES)[number];
