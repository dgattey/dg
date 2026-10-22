import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { PAPER_PALETTE } from '../src/app/collage/paperPalette';
import { MARK_PATHS, MARK_VIEW_BOX } from '../src/app/layouts/logoMark';

const PUBLIC_DIR = join(__dirname, '../public');
const [, , markBoxWidth = 1, markBoxHeight = 1] = MARK_VIEW_BOX.split(' ').map(Number);

/** A stamp layout in a 100-unit square canvas. */
type StampLayout = {
  height: number;
  markWidth: number;
  radius: number;
  ring: number;
  width: number;
};

/** Fills the favicon so the mark stays legible at 16px. */
const FAVICON_STAMP: StampLayout = { height: 68, markWidth: 68, radius: 12, ring: 5, width: 84 };
/** Its corners stay inside the maskable safe circle (radius 40). */
const APP_STAMP: StampLayout = { height: 42, markWidth: 40, radius: 8, ring: 3.5, width: 56 };

function stampSvg({ height, markWidth, radius, ring, width }: StampLayout, opaque: boolean) {
  const x = 50 - width / 2;
  const y = 50 - height / 2;
  const markHeight = markWidth / (markBoxWidth / markBoxHeight);
  const marks = MARK_PATHS.map(
    ({ d, dx }) => `<path d="${d}"${dx ? ` transform="translate(${dx} 0)"` : ''}/>`,
  ).join('');
  const ringRect = `x="${x - ring}" y="${y - ring}" width="${width + 2 * ring}" height="${height + 2 * ring}" rx="${radius + ring}"`;
  const shadow = opaque
    ? `<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter><rect ${ringRect} fill="#000" opacity="0.2" filter="url(#s)" transform="translate(0 2.5)"/>`
    : '';
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    opaque ? `<rect width="100" height="100" fill="${PAPER_PALETTE.paper}"/>` : '',
    '<g transform="rotate(-4 50 50)">',
    shadow,
    `<rect ${ringRect} fill="${PAPER_PALETTE.cream}"/>`,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${PAPER_PALETTE.viridian}"/>`,
    `<svg x="${50 - markWidth / 2}" y="${50 - markHeight / 2}" width="${markWidth}" height="${markHeight}" viewBox="${MARK_VIEW_BOX}" fill="${PAPER_PALETTE.cream}">${marks}</svg>`,
    '</g></svg>',
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
  const favicon = stampSvg(FAVICON_STAMP, false);
  const appIcon = stampSvg(APP_STAMP, true);
  const icoPngs = await Promise.all(
    [16, 32, 48].map(async (size) => ({ data: await renderPng(favicon, size), size })),
  );
  const files: Record<string, string | Buffer> = {
    'apple-touch-icon.png': await renderPng(appIcon, 180),
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
