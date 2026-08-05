/** Caption size in px — the font-size under footer icon links / menu labels. */
export const FOOTER_ICON_BASE_PX = 14;

/**
 * Footer icon links set this font-size; lucide icons use `1em` so they resolve
 * against it. Equals caption (14px) × 1.25.
 */
export const FOOTER_ICON_FONT_SIZE = '1.25em';

/** Exact 18px footer icon size from the small breakpoint upward. */
export const FOOTER_ICON_DESKTOP_FONT_SIZE = `${18 / FOOTER_ICON_BASE_PX}em`;
