import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { PAPER_PALETTE } from '../src/app/collage/paperPalette';
import {
  STICKER_ASPECT,
  STICKER_MAT_WIDTH,
  STICKER_PALETTE_INKS,
  STICKER_VIEW_BOX,
  stickerPaths,
} from '../src/app/layouts/logoMark';

const PUBLIC_DIR = join(__dirname, '../public');

/** The sticker's place in a 100-unit square canvas. */
type IconLayout = {
  background?: string;
  shadow: boolean;
  width: number;
};

/** Upright and edge to edge, so stems land on whole pixels and the mark fills 16px. */
const FAVICON: IconLayout = { shadow: false, width: 100 };
/** Leaves room for the shadow. */
const APP_ICON: IconLayout = { shadow: true, width: 88 };
/** iOS paints a transparent touch icon's background black, so it sits on the page's paper. */
const TOUCH_ICON: IconLayout = { background: PAPER_PALETTE.paper, shadow: true, width: 76 };

/** `StickerMark` as a string, for librsvg. */
function stickerSvg(x: number, y: number, width: number, height: number) {
  const { glyphs, mat } = stickerPaths(STICKER_PALETTE_INKS);
  const paper = STICKER_PALETTE_INKS.mat;
  const at = (transform: string | undefined) => (transform ? ` transform="${transform}"` : '');
  return [
    `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${STICKER_VIEW_BOX}">`,
    `<g fill="${paper}" stroke="${paper}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${STICKER_MAT_WIDTH}">`,
    ...mat.map(({ d, transform }) => `<path d="${d}"${at(transform)}/>`),
    '</g>',
    ...glyphs.map(({ d, fill, transform }) => `<path d="${d}" fill="${fill}"${at(transform)}/>`),
    '</svg>',
  ].join('');
}

function iconSvg({ background, shadow, width }: IconLayout) {
  const height = width / STICKER_ASPECT;
  const placed = stickerSvg(50 - width / 2, 50 - height / 2, width, height);
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    shadow
      ? '<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dy="1.5" stdDeviation="1.5" flood-opacity="0.22"/></filter>'
      : '',
    background ? `<rect width="100" height="100" fill="${background}"/>` : '',
    shadow ? `<g filter="url(#s)">${placed}</g>` : placed,
    '</svg>',
  ].join('');
}

/** librsvg rasterizes at the SVG's own size, so each PNG gets a sized copy. */
function renderPng(svg: string, size: number) {
  const sized = svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
  return sharp(Buffer.from(sized)).png().toBuffer();
}

/** PNG-in-ICO: a 6-byte header, one 16-byte entry per image, then the PNGs. */
function encodeIco(pngs: ReadonlyArray<{ data: Buffer; size: number }>) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ data, size }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map(({ data }) => data)]);
}

async function main() {
  const favicon = iconSvg(FAVICON);
  const appIcon = iconSvg(APP_ICON);
  const icoPngs = await Promise.all(
    [16, 32, 48].map(async (size) => ({ data: await renderPng(favicon, size), size })),
  );
  const files: Record<string, string | Buffer> = {
    'apple-touch-icon.png': await renderPng(iconSvg(TOUCH_ICON), 180),
    'favicon.ico': encodeIco(icoPngs),
    'icon-192.png': await renderPng(appIcon, 192),
    'icon-512.png': await renderPng(appIcon, 512),
    'icon.svg': `${favicon}\n`,
  };
  await Promise.all(
    Object.entries(files).map(([name, data]) => writeFile(join(PUBLIC_DIR, name), data)),
  );
  process.stdout.write(`wrote ${Object.keys(files).join(', ')} to ${PUBLIC_DIR}\n`);
}

main();
