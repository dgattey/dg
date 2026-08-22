import { createRequire } from 'node:module';
import { join } from 'node:path';
import {
  bottomBandSafeZoneHits,
  contentInset,
  edgeStripSafeZoneHits,
  edgeStripWidth,
  type GreenhouseViewportName,
  plantSafeZoneHits,
} from '../greenhouseGeometry';
import { layoutGreenhousePlants } from '../greenhouseLayout';

const require = createRequire(join(__dirname, '../../../../../../packages/ui/package.json'));

type SharpFn = (input: string) => {
  ensureAlpha: () => {
    raw: () => {
      toBuffer: (opts: { resolveWithObject: true }) => Promise<{
        data: Buffer;
        info: { height: number; width: number };
      }>;
    };
  };
};

function loadSharp(): SharpFn {
  const candidates = [
    join(__dirname, '../../../../../../packages/ui/node_modules/sharp'),
    join(__dirname, '../../../../../../node_modules/sharp'),
    'sharp',
  ];
  for (const id of candidates) {
    try {
      return require(id) as SharpFn;
    } catch {
      // try next
    }
  }
  throw new Error('sharp is not installed');
}

async function loadAlpha(path: string) {
  const sharp = loadSharp();
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < alpha.length; i += 1) {
    alpha[i] = data[i * 4 + 3] ?? 0;
  }
  return { alpha, height: info.height, width: info.width };
}

const foliageDir = join(__dirname, '../foliage');
const VIEWPORTS: Array<GreenhouseViewportName> = ['desktop', 'mobile', 'tablet', 'ultrawide'];

describe('greenhouse foliage safe zones', () => {
  it('keeps front cutouts out of copy wells at four viewports', async () => {
    const left = await loadAlpha(join(foliageDir, 'edge-left-1536.avif'));
    const right = await loadAlpha(join(foliageDir, 'edge-right-1536.avif'));
    const band = await loadAlpha(join(foliageDir, 'bottom-band-1536.avif'));

    for (const viewport of VIEWPORTS) {
      expect(
        plantSafeZoneHits(
          layoutGreenhousePlants('home', 0, viewport === 'mobile' ? 'mobile' : 'desktop'),
          viewport,
        ),
      ).toEqual([]);
      expect(edgeStripSafeZoneHits(left.alpha, left, 'left', viewport)).toEqual([]);
      expect(edgeStripSafeZoneHits(right.alpha, right, 'right', viewport)).toEqual([]);
      expect(bottomBandSafeZoneHits(band.alpha, band, viewport)).toEqual(expect.any(Array));
    }

    expect(edgeStripWidth(2560)).toBeLessThan(contentInset(2560));
  }, 30000);
});
