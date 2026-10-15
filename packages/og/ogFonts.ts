import { readFile } from 'node:fs/promises';

export const TEXT_FONT = 'SF Pro';
export const LOGO_FONT = 'SF Pro Display Heavy';

export const TEXT_FONT_URL = new URL('./SFProText.ttf', import.meta.url);
export const LOGO_FONT_URL = new URL('./SFProDisplayHeavy.ttf', import.meta.url);

/** Copied into a standalone `ArrayBuffer`, the shape `ImageResponse` fonts take. */
const readFontData = async (fontUrl: URL) => new Uint8Array(await readFile(fontUrl)).buffer;

export const getTextFontData = () => readFontData(TEXT_FONT_URL);

export const getLogoFontData = () => readFontData(LOGO_FONT_URL);
