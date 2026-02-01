export const TEXT_FONT = 'SF Pro';
export const LOGO_FONT = 'SF Pro Display Heavy';

export const TEXT_FONT_URL = new URL('./SFProText.ttf', import.meta.url);
export const LOGO_FONT_URL = new URL('./SFProDisplayHeavy.ttf', import.meta.url);

let textFontData: Promise<ArrayBuffer> | undefined;
let logoFontData: Promise<ArrayBuffer> | undefined;

const loadFont = (fontUrl: URL) => fetch(fontUrl).then((res) => res.arrayBuffer());

export const getTextFontData = () => {
  if (!textFontData) {
    textFontData = loadFont(TEXT_FONT_URL);
  }
  return textFontData;
};

export const getLogoFontData = () => {
  if (!logoFontData) {
    logoFontData = loadFont(LOGO_FONT_URL);
  }
  return logoFontData;
};
