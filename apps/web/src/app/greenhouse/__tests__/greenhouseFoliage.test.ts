import { createRequire } from 'node:module';
import { join } from 'node:path';
import {
  FOLIAGE_SAFE_VIEWPORTS,
  type PlantAlpha,
  plantOpaqueCopyHits,
} from '../greenhouseGeometry';
import type { LeafSymbol } from '../greenhouseLayout';
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

async function loadAlpha(path: string): Promise<PlantAlpha> {
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

const SPECIES = {
  'leaf-bop': 'bop-1024.avif',
  'leaf-calathea': 'calathea-1024.avif',
  'leaf-monstera': 'monstera-1024.avif',
  'leaf-nerve': 'nerve-1024.avif',
  'leaf-pothos': 'pothos-1024.avif',
  'leaf-prayer': 'prayer-1024.avif',
  'leaf-zz': 'zz-1024.avif',
} as const satisfies Record<LeafSymbol, string>;

describe('greenhouse foliage safe zones', () => {
  it('fails if opaque foliage (alpha > 0.5) crosses a copy well past the allowed overlap', async () => {
    const images = {
      'leaf-bop': await loadAlpha(join(foliageDir, SPECIES['leaf-bop'])),
      'leaf-calathea': await loadAlpha(join(foliageDir, SPECIES['leaf-calathea'])),
      'leaf-monstera': await loadAlpha(join(foliageDir, SPECIES['leaf-monstera'])),
      'leaf-nerve': await loadAlpha(join(foliageDir, SPECIES['leaf-nerve'])),
      'leaf-pothos': await loadAlpha(join(foliageDir, SPECIES['leaf-pothos'])),
      'leaf-prayer': await loadAlpha(join(foliageDir, SPECIES['leaf-prayer'])),
      'leaf-zz': await loadAlpha(join(foliageDir, SPECIES['leaf-zz'])),
    };

    for (const size of FOLIAGE_SAFE_VIEWPORTS) {
      const viewport = size.width < 576 ? 'mobile' : 'desktop';
      expect(
        plantOpaqueCopyHits(layoutGreenhousePlants('home', 0, viewport), size, images),
      ).toEqual([]);
      expect(
        plantOpaqueCopyHits(layoutGreenhousePlants('music', 0, viewport), size, images, 'music'),
      ).toEqual([]);
    }
  }, 30000);
});
