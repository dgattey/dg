import type { SceneryKind } from './forestMap';

/**
 * Blocky scenery, drawn once into `<defs>` and stamped with `<use>`.
 *
 * Everything is axis-aligned rectangles in a 16x16 box whose baseline is y=16,
 * so sprites can be hung above their tile and still look planted. Each one gets
 * a ground shadow and a lit left face, which is all the fake depth a top-down
 * map needs to read as solid rather than flat.
 */

export const SPRITE_ID: Record<SceneryKind, string> = {
  bloom: 'forest-bloom',
  oak: 'forest-oak',
  pine: 'forest-pine',
  reed: 'forest-reed',
  rock: 'forest-rock',
  stump: 'forest-stump',
};

/** Multiples of a tile. Trees overhang their tile so the canopy layers overlap. */
export const SPRITE_SCALE: Record<SceneryKind, { height: number; width: number }> = {
  bloom: { height: 1, width: 1 },
  oak: { height: 1.7, width: 1.6 },
  pine: { height: 1.9, width: 1.5 },
  reed: { height: 1.1, width: 1 },
  rock: { height: 1.1, width: 1.1 },
  stump: { height: 1, width: 1 },
};

function GroundShadow() {
  return <ellipse cx="8" cy="14.9" fill="var(--forest-shadow)" rx="5.1" ry="1.5" />;
}

export function ForestSpriteDefs() {
  return (
    <defs>
      <symbol id={SPRITE_ID.pine} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark-dark)" height="4" width="2.2" x="6.9" y="11" />
        <rect fill="var(--forest-canopy-pine)" height="3.2" width="10.4" x="2.8" y="8.2" />
        <rect fill="var(--forest-canopy-pine)" height="3.2" width="8.4" x="3.8" y="5.4" />
        <rect fill="var(--forest-canopy-pine)" height="3.2" width="6.2" x="4.9" y="2.7" />
        <rect fill="var(--forest-canopy-pine)" height="2.4" width="3.4" x="6.3" y="0.7" />
        <rect fill="var(--forest-canopy-pine-light)" height="1.1" width="4.2" x="2.8" y="8.2" />
        <rect fill="var(--forest-canopy-pine-light)" height="1.1" width="3.4" x="3.8" y="5.4" />
        <rect fill="var(--forest-canopy-pine-light)" height="1" width="2.6" x="4.9" y="2.7" />
      </symbol>

      <symbol id={SPRITE_ID.oak} viewBox="0 0 16 16">
        <GroundShadow />
        <rect fill="var(--forest-bark)" height="5" width="2.4" x="6.8" y="10" />
        <rect fill="var(--forest-canopy)" height="6.6" width="11.4" x="2.3" y="4" />
        <rect fill="var(--forest-canopy)" height="3.4" width="8" x="4" y="1.9" />
        <rect fill="var(--forest-canopy-light)" height="2.2" width="4.4" x="3.4" y="4.6" />
        <rect fill="var(--forest-canopy-light)" height="1.4" width="3" x="4.6" y="2.6" />
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
    </defs>
  );
}
