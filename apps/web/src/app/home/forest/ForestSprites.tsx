import type { CritterKind, SceneryKind } from './forestMap';

/**
 * Blocky scenery, drawn once into `<defs>` and stamped with `<use>`.
 *
 * Everything is axis-aligned rectangles in a 16x16 box whose baseline is y=16,
 * so sprites can be hung above their tile and still look planted. Each one gets
 * a ground shadow and a lit left face. Canopies have a bit of branch structure
 * so pine, oak, birch and willow read as different trees from a distance.
 */

export const SPRITE_ID: Record<SceneryKind, string> = {
  birch: 'forest-birch',
  bloom: 'forest-bloom',
  dead: 'forest-dead',
  oak: 'forest-oak',
  pine: 'forest-pine',
  reed: 'forest-reed',
  rock: 'forest-rock',
  stump: 'forest-stump',
  willow: 'forest-willow',
};

export const CRITTER_ID: Record<CritterKind, string> = {
  bird: 'forest-bird',
  deer: 'forest-deer',
  fish: 'forest-fish',
  fox: 'forest-fox',
  rabbit: 'forest-rabbit',
};

export const PIXELATE_FILTER_ID = 'forest-pixelate';

/** Multiples of a tile. Trees overhang their tile so the canopy layers overlap. */
export const SPRITE_SCALE: Record<SceneryKind, { height: number; width: number }> = {
  birch: { height: 2.3, width: 1.7 },
  bloom: { height: 1, width: 1 },
  dead: { height: 2.0, width: 1.5 },
  oak: { height: 2.2, width: 2.0 },
  pine: { height: 2.5, width: 1.8 },
  reed: { height: 1.2, width: 1 },
  rock: { height: 1.1, width: 1.1 },
  stump: { height: 1, width: 1 },
  willow: { height: 2.1, width: 2.3 },
};

export const CRITTER_SCALE: Record<CritterKind, { height: number; width: number }> = {
  bird: { height: 0.7, width: 0.9 },
  deer: { height: 1.1, width: 1.3 },
  fish: { height: 0.5, width: 0.8 },
  fox: { height: 0.8, width: 1.1 },
  rabbit: { height: 0.6, width: 0.7 },
};

export const WINDY_KINDS: ReadonlySet<SceneryKind> = new Set<SceneryKind>([
  'birch',
  'dead',
  'oak',
  'pine',
  'reed',
  'willow',
]);

function GroundShadow() {
  return <ellipse cx="8" cy="14.9" fill="var(--forest-shadow)" rx="5.1" ry="1.5" />;
}

export function ForestSpriteDefs() {
  return (
    <defs>
      <filter
        colorInterpolationFilters="sRGB"
        height="100%"
        id={PIXELATE_FILTER_ID}
        width="100%"
        x="0"
        y="0"
      >
        <feFlood height="2" width="2" x="4" y="4" />
        <feComposite height="8" width="8" />
        <feTile result="a" />
        <feComposite in="SourceGraphic" in2="a" operator="in" />
        <feMorphology operator="dilate" radius="4" />
      </filter>

      <symbol id={SPRITE_ID.pine} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark-dark)" height="5" width="2" x="7" y="10.4" />
        <rect fill="var(--forest-bark)" height="5" width="0.7" x="7" y="10.4" />
        <rect fill="var(--forest-canopy-pine)" height="3.4" width="11" x="2.5" y="8" />
        <rect fill="var(--forest-canopy-pine)" height="3.2" width="8.6" x="3.7" y="5.2" />
        <rect fill="var(--forest-canopy-pine)" height="3" width="6.2" x="4.9" y="2.6" />
        <rect fill="var(--forest-canopy-pine)" height="2.2" width="3.4" x="6.3" y="0.8" />
        <rect fill="var(--forest-canopy-pine-light)" height="1.2" width="4.4" x="2.5" y="8" />
        <rect fill="var(--forest-canopy-pine-light)" height="1.1" width="3.4" x="3.7" y="5.2" />
        <rect fill="var(--forest-canopy-pine-light)" height="1" width="2.4" x="4.9" y="2.6" />
      </symbol>

      <symbol id={SPRITE_ID.oak} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark)" height="6" width="2.4" x="6.8" y="9.2" />
        <rect fill="var(--forest-bark-dark)" height="2.2" width="3.6" x="4.2" y="7.6" />
        <rect fill="var(--forest-bark-dark)" height="1.8" width="3" x="9.2" y="8.2" />
        <rect fill="var(--forest-canopy)" height="7" width="12" x="2" y="3.2" />
        <rect fill="var(--forest-canopy)" height="3.2" width="7.4" x="4.2" y="1.4" />
        <rect fill="var(--forest-canopy)" height="2.4" width="3.2" x="1.2" y="5.6" />
        <rect fill="var(--forest-canopy)" height="2.2" width="2.8" x="12" y="6" />
        <rect fill="var(--forest-canopy-light)" height="2.4" width="4.8" x="2.6" y="4" />
        <rect fill="var(--forest-canopy-light)" height="1.4" width="3" x="5" y="2" />
      </symbol>

      <symbol id={SPRITE_ID.birch} viewBox="0 0 16 16">
        <GroundShadow />
        <rect
          fill="light-dark(hsl(40deg 30% 86%), hsl(40deg 12% 62%))"
          height="7.4"
          width="2"
          x="7"
          y="8"
        />
        <rect fill="var(--forest-bark-dark)" height="1.2" width="2" x="7" y="9.4" />
        <rect fill="var(--forest-bark-dark)" height="1" width="2" x="7" y="12.2" />
        <rect fill="var(--forest-canopy-light)" height="5.6" width="9.2" x="3.4" y="2.6" />
        <rect fill="var(--forest-canopy)" height="3" width="6.2" x="4.8" y="1.2" />
        <rect
          fill="light-dark(hsl(88deg 40% 58%), hsl(150deg 28% 34%))"
          height="1.6"
          width="3.2"
          x="4"
          y="3.4"
        />
      </symbol>

      <symbol id={SPRITE_ID.willow} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark)" height="5.4" width="2" x="7" y="9.6" />
        <rect fill="var(--forest-canopy-light)" height="8.4" width="2.2" x="2.2" y="5.4" />
        <rect fill="var(--forest-canopy-light)" height="9" width="2.2" x="4.6" y="4.4" />
        <rect fill="var(--forest-canopy)" height="6.2" width="8.8" x="3.6" y="2.2" />
        <rect fill="var(--forest-canopy-light)" height="8.8" width="2.2" x="9.2" y="5" />
        <rect fill="var(--forest-canopy-light)" height="7.6" width="2" x="11.8" y="6.2" />
        <rect fill="var(--forest-canopy-light)" height="1.8" width="5" x="5" y="2.4" />
      </symbol>

      <symbol id={SPRITE_ID.dead} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark-dark)" height="8" width="1.6" x="7.2" y="7.2" />
        <rect fill="var(--forest-bark-dark)" height="1.4" width="4.4" x="3.6" y="6.4" />
        <rect fill="var(--forest-bark-dark)" height="1.2" width="3.6" x="8.4" y="8.2" />
        <rect fill="var(--forest-bark)" height="3.2" width="1.2" x="3.6" y="3.4" />
        <rect fill="var(--forest-bark)" height="2.6" width="1.2" x="10.8" y="5.8" />
      </symbol>

      <symbol id={SPRITE_ID.rock} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-rock)" height="5.4" width="8.6" x="3.7" y="8.8" />
        <rect fill="var(--forest-rock)" height="3" width="5.4" x="5.3" y="6.4" />
        <rect fill="var(--forest-rock-light)" height="1.6" width="3.4" x="4.4" y="8.8" />
        <rect fill="var(--forest-rock-light)" height="1.2" width="2.4" x="5.9" y="6.4" />
      </symbol>

      <symbol id={SPRITE_ID.stump} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark-dark)" height="4" width="6.4" x="4.8" y="10.4" />
        <rect fill="var(--forest-bark)" height="1.8" width="6.4" x="4.8" y="9.2" />
      </symbol>

      <symbol id={SPRITE_ID.bloom} viewBox="0 0 16 16">
        <rect fill="var(--forest-bloom)" height="1.8" width="1.8" x="4.6" y="8.4" />
        <rect fill="var(--forest-bloom-alt)" height="1.6" width="1.6" x="8.6" y="10" />
        <rect fill="var(--forest-bloom)" height="1.4" width="1.4" x="7.4" y="6.6" />
      </symbol>

      <symbol id={SPRITE_ID.reed} viewBox="0 0 16 16">
        <rect fill="var(--forest-canopy-light)" height="6" width="1.2" x="5.4" y="8.4" />
        <rect fill="var(--forest-canopy-light)" height="7.4" width="1.2" x="7.6" y="7" />
        <rect fill="var(--forest-canopy)" height="5.2" width="1.2" x="9.6" y="9.2" />
      </symbol>

      <symbol id={CRITTER_ID.fish} viewBox="0 0 16 16">
        <rect
          fill="light-dark(hsl(200deg 50% 62%), hsl(196deg 40% 48%))"
          height="2.2"
          width="5.4"
          x="4"
          y="8"
        />
        <rect
          fill="light-dark(hsl(32deg 70% 70%), hsl(32deg 50% 50%))"
          height="1.6"
          width="1.6"
          x="8.8"
          y="8.2"
        />
        <rect fill="var(--forest-surf)" height="1.2" width="1.2" x="3" y="8.4" />
      </symbol>

      <symbol id={CRITTER_ID.rabbit} viewBox="0 0 16 16">
        <ellipse cx="8" cy="14.6" fill="var(--forest-shadow)" rx="3" ry="0.9" />
        <rect
          fill="light-dark(hsl(30deg 20% 72%), hsl(30deg 12% 42%))"
          height="3.2"
          width="4.4"
          x="5.6"
          y="10.4"
        />
        <rect
          fill="light-dark(hsl(30deg 20% 78%), hsl(30deg 12% 50%))"
          height="2.2"
          width="2.4"
          x="8.8"
          y="9.2"
        />
        <rect
          fill="light-dark(hsl(30deg 18% 64%), hsl(30deg 10% 36%))"
          height="2.8"
          width="1"
          x="9.4"
          y="6.6"
        />
        <rect
          fill="light-dark(hsl(30deg 18% 64%), hsl(30deg 10% 36%))"
          height="2.4"
          width="1"
          x="10.6"
          y="7"
        />
      </symbol>

      <symbol id={CRITTER_ID.fox} viewBox="0 0 16 16">
        <ellipse cx="8" cy="14.7" fill="var(--forest-shadow)" rx="3.4" ry="0.9" />
        <rect
          fill="light-dark(hsl(24deg 72% 48%), hsl(24deg 55% 38%))"
          height="2.8"
          width="6.4"
          x="4.2"
          y="10.6"
        />
        <rect
          fill="light-dark(hsl(24deg 72% 48%), hsl(24deg 55% 38%))"
          height="2.2"
          width="2.6"
          x="9.6"
          y="9.4"
        />
        <rect
          fill="light-dark(hsl(36deg 40% 88%), hsl(36deg 20% 70%))"
          height="1.2"
          width="1.8"
          x="4.4"
          y="12.2"
        />
        <rect
          fill="light-dark(hsl(24deg 60% 36%), hsl(24deg 40% 24%))"
          height="2.4"
          width="1.2"
          x="11.4"
          y="7.2"
        />
      </symbol>

      <symbol id={CRITTER_ID.deer} viewBox="0 0 16 16">
        <ellipse cx="8" cy="14.8" fill="var(--forest-shadow)" rx="3.8" ry="1" />
        <rect
          fill="light-dark(hsl(28deg 38% 42%), hsl(28deg 24% 28%))"
          height="3.4"
          width="6.8"
          x="3.8"
          y="10"
        />
        <rect
          fill="light-dark(hsl(28deg 38% 42%), hsl(28deg 24% 28%))"
          height="2.6"
          width="2.4"
          x="9.6"
          y="8.2"
        />
        <rect
          fill="light-dark(hsl(28deg 30% 28%), hsl(28deg 20% 18%))"
          height="3.2"
          width="1.1"
          x="4.4"
          y="12.2"
        />
        <rect
          fill="light-dark(hsl(28deg 30% 28%), hsl(28deg 20% 18%))"
          height="3.2"
          width="1.1"
          x="8.4"
          y="12.2"
        />
        <rect fill="var(--forest-bark-dark)" height="2.4" width="0.8" x="10.2" y="5.8" />
        <rect fill="var(--forest-bark-dark)" height="2.4" width="0.8" x="11.4" y="5.8" />
      </symbol>

      <symbol id={CRITTER_ID.bird} viewBox="0 0 16 16">
        <rect
          fill="light-dark(hsl(220deg 18% 28%), hsl(220deg 12% 70%))"
          height="1.2"
          width="5.6"
          x="2.4"
          y="8.2"
        />
        <rect
          fill="light-dark(hsl(220deg 18% 28%), hsl(220deg 12% 70%))"
          height="1.2"
          width="5.6"
          x="8"
          y="8.2"
        />
        <rect
          fill="light-dark(hsl(220deg 16% 22%), hsl(220deg 10% 80%))"
          height="1.4"
          width="2"
          x="7"
          y="7.4"
        />
      </symbol>
    </defs>
  );
}
