import type { CritterKind, SceneryKind } from './forestMap';

/**
 * Scenery drawn once into `<defs>` and stamped with `<use>`.
 *
 * Species are different silhouettes, not the same canopy recolored: pine is a
 * stack of triangles, oak a round two-tone blob, willow a leaning drape, dead
 * a bare snag, bush a low mound. Critters are readable at stamp size — a deer
 * has legs and antlers, not a brown speck.
 */

export const SPRITE_ID: Record<SceneryKind, string> = {
  birch: 'forest-birch',
  bloom: 'forest-bloom',
  bush: 'forest-bush',
  cedar: 'forest-cedar',
  dead: 'forest-dead',
  fruit: 'forest-fruit',
  log: 'forest-log',
  maple: 'forest-maple',
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

export const SPRITE_VIEWBOX: Record<SceneryKind, string> = {
  birch: '0 0 24 32',
  bloom: '0 0 16 16',
  bush: '0 0 24 18',
  cedar: '0 0 24 32',
  dead: '0 0 24 32',
  fruit: '0 0 24 32',
  log: '0 0 16 16',
  maple: '0 0 24 32',
  oak: '0 0 24 32',
  pine: '0 0 24 32',
  reed: '0 0 16 16',
  rock: '0 0 16 16',
  stump: '0 0 16 16',
  willow: '0 0 24 32',
};

export const CRITTER_VIEWBOX: Record<CritterKind, string> = {
  bird: '0 0 24 16',
  deer: '0 0 24 16',
  fish: '0 0 24 16',
  fox: '0 0 24 16',
  rabbit: '0 0 24 16',
};

/** Multiples of a tile. Trees overhang their tile so the canopy layers overlap. */
export const SPRITE_SCALE: Record<SceneryKind, { height: number; width: number }> = {
  birch: { height: 3.15, width: 1.8 },
  bloom: { height: 0.85, width: 0.85 },
  bush: { height: 1.25, width: 1.9 },
  cedar: { height: 3.7, width: 1.6 },
  dead: { height: 2.9, width: 1.8 },
  fruit: { height: 2.8, width: 2.25 },
  log: { height: 0.8, width: 2.1 },
  maple: { height: 3.1, width: 2.55 },
  oak: { height: 3, width: 2.65 },
  pine: { height: 3.5, width: 2.05 },
  reed: { height: 1.55, width: 1.05 },
  rock: { height: 1, width: 1.35 },
  stump: { height: 1, width: 1.15 },
  willow: { height: 2.85, width: 3 },
};

export const CRITTER_SCALE: Record<CritterKind, { height: number; width: number }> = {
  bird: { height: 1, width: 1.6 },
  deer: { height: 1.95, width: 2.45 },
  fish: { height: 0.7, width: 1.25 },
  fox: { height: 1.35, width: 1.85 },
  rabbit: { height: 1.15, width: 1.25 },
};

export const WINDY_KINDS: ReadonlySet<SceneryKind> = new Set<SceneryKind>([
  'birch',
  'bush',
  'cedar',
  'dead',
  'fruit',
  'maple',
  'oak',
  'pine',
  'reed',
  'willow',
]);

function TreeShadow() {
  return <ellipse cx="12" cy="30.6" fill="var(--forest-shadow)" rx="7.2" ry="1.5" />;
}

export function ForestSpriteDefs() {
  return (
    <defs>
      <symbol id={SPRITE_ID.pine} viewBox="0 0 24 32">
        <TreeShadow />
        <rect fill="var(--forest-bark-dark)" height="8" width="2.2" x="10.9" y="22" />
        <rect fill="var(--forest-bark)" height="8" width="0.8" x="10.9" y="22" />
        <polygon fill="var(--forest-canopy-pine)" points="12,3 5.5,13.5 18.5,13.5" />
        <polygon fill="var(--forest-canopy-pine)" points="12,8 3.5,19.5 20.5,19.5" />
        <polygon fill="var(--forest-canopy-pine)" points="12,14 2,26 22,26" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,3 5.5,13.5 12,13.5" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,8 3.5,19.5 12,19.5" />
      </symbol>

      <symbol id={SPRITE_ID.cedar} viewBox="0 0 24 32">
        <TreeShadow />
        <rect fill="var(--forest-bark-dark)" height="6.5" width="1.6" x="11.2" y="24" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,1.5 8.4,10 15.6,10" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,6 7.2,16 16.8,16" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,12 6.2,22 17.8,22" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,18 5.4,27.5 18.6,27.5" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,1.5 8.4,10 12,10" />
      </symbol>

      <symbol id={SPRITE_ID.oak} viewBox="0 0 24 32">
        <TreeShadow />
        <rect fill="var(--forest-bark)" height="10" width="3" x="10.5" y="20" />
        <rect fill="var(--forest-bark-dark)" height="2.4" width="5" x="6.4" y="18.6" />
        <rect fill="var(--forest-bark-dark)" height="2" width="4.2" x="13.2" y="19.4" />
        <ellipse cx="12" cy="14" fill="var(--forest-canopy)" rx="9.4" ry="7.6" />
        <ellipse cx="4.8" cy="15.6" fill="var(--forest-canopy)" rx="5.2" ry="4.4" />
        <ellipse cx="19.2" cy="16.2" fill="var(--forest-canopy)" rx="4.6" ry="4" />
        <ellipse cx="12.6" cy="7.4" fill="var(--forest-canopy)" rx="5.4" ry="4.2" />
        <ellipse cx="7.2" cy="9.4" fill="var(--forest-canopy-light)" rx="4.2" ry="3.2" />
        <ellipse cx="15.4" cy="10.2" fill="var(--forest-canopy-light)" rx="3.6" ry="2.6" />
      </symbol>

      <symbol id={SPRITE_ID.maple} viewBox="0 0 24 32">
        <TreeShadow />
        <rect fill="var(--forest-bark)" height="9" width="2.6" x="10.7" y="21" />
        <polygon
          fill="var(--forest-canopy-maple)"
          points="12,4 7,9 2.5,12 5,16 3,21 9,18 12,23 15,18 21,21 19,16 21.5,12 17,9"
        />
        <polygon fill="var(--forest-canopy-maple-light)" points="12,4 7,9 12,12 17,9" />
        <ellipse cx="8.2" cy="12.4" fill="var(--forest-canopy-maple-light)" rx="2.6" ry="1.8" />
      </symbol>

      <symbol id={SPRITE_ID.birch} viewBox="0 0 24 32">
        <TreeShadow />
        <rect
          fill="light-dark(hsl(40deg 30% 88%), hsl(40deg 12% 64%))"
          height="16"
          width="2.2"
          x="10.9"
          y="14.4"
        />
        <rect fill="var(--forest-bark-dark)" height="1.3" width="2.2" x="10.9" y="17.2" />
        <rect fill="var(--forest-bark-dark)" height="1.1" width="2.2" x="10.9" y="21.4" />
        <rect fill="var(--forest-bark-dark)" height="1" width="2.2" x="10.9" y="25.6" />
        <ellipse cx="12" cy="11.2" fill="var(--forest-canopy-light)" rx="7.4" ry="6.2" />
        <ellipse cx="12" cy="7.6" fill="var(--forest-canopy)" rx="4.4" ry="3.2" />
        <ellipse
          cx="8.2"
          cy="11"
          fill="light-dark(hsl(88deg 40% 58%), hsl(150deg 28% 34%))"
          rx="2.4"
          ry="1.6"
        />
      </symbol>

      <symbol id={SPRITE_ID.willow} viewBox="0 0 24 32">
        <ellipse cx="11" cy="30.6" fill="var(--forest-shadow)" rx="8" ry="1.4" />
        <polygon fill="var(--forest-bark)" points="14.8,31 16.6,31 11.4,12 9.6,12" />
        <ellipse cx="10.4" cy="11" fill="var(--forest-canopy)" rx="6.4" ry="4.2" />
        <ellipse cx="5.2" cy="18" fill="var(--forest-canopy-light)" rx="2.1" ry="8.4" />
        <ellipse cx="8.4" cy="19.4" fill="var(--forest-canopy-light)" rx="2" ry="9" />
        <ellipse cx="11.6" cy="18.6" fill="var(--forest-canopy)" rx="2.2" ry="8.2" />
        <ellipse cx="14.8" cy="20" fill="var(--forest-canopy-light)" rx="1.9" ry="7.6" />
        <ellipse cx="17.6" cy="21.2" fill="var(--forest-canopy-light)" rx="1.7" ry="6.4" />
      </symbol>

      <symbol id={SPRITE_ID.dead} viewBox="0 0 24 32">
        <TreeShadow />
        <rect fill="var(--forest-bark-dark)" height="18" width="1.8" x="11.1" y="12.4" />
        <polygon fill="var(--forest-bark-dark)" points="12,14 3.5,8.5 4.3,7.6 12,12.2" />
        <polygon fill="var(--forest-bark)" points="12.6,16.5 20.4,10 21.2,10.8 13.2,17.6" />
        <polygon fill="var(--forest-bark)" points="12,10 8.2,4.2 9,3.6 12.6,9.4" />
        <rect fill="var(--forest-bark-dark)" height="3.4" width="1.1" x="19.6" y="10" />
      </symbol>

      <symbol id={SPRITE_ID.fruit} viewBox="0 0 24 32">
        <TreeShadow />
        <rect fill="var(--forest-bark)" height="9.2" width="2.4" x="10.8" y="20.6" />
        <ellipse cx="12" cy="14.2" fill="var(--forest-canopy)" rx="8.8" ry="7.4" />
        <ellipse cx="12" cy="9.6" fill="var(--forest-canopy)" rx="5.2" ry="3.6" />
        <ellipse cx="8" cy="12.2" fill="var(--forest-canopy-light)" rx="3.4" ry="2.6" />
        <circle cx="7.2" cy="16.4" fill="var(--forest-bloom)" r="1.15" />
        <circle cx="14.8" cy="13.6" fill="var(--forest-bloom-alt)" r="1.05" />
        <circle cx="11.4" cy="18.6" fill="var(--forest-bloom)" r="0.95" />
        <circle cx="16.6" cy="17.2" fill="var(--forest-bloom-alt)" r="0.85" />
      </symbol>

      <symbol id={SPRITE_ID.bush} viewBox="0 0 24 18">
        <ellipse cx="12" cy="16.4" fill="var(--forest-shadow)" rx="8" ry="1.3" />
        <ellipse cx="12" cy="11.4" fill="var(--forest-canopy)" rx="9.4" ry="5.6" />
        <ellipse cx="6.4" cy="12.6" fill="var(--forest-canopy)" rx="4.6" ry="3.6" />
        <ellipse cx="17.6" cy="12.8" fill="var(--forest-canopy)" rx="4.2" ry="3.4" />
        <ellipse cx="9.2" cy="9.2" fill="var(--forest-canopy-light)" rx="4" ry="2.8" />
        <ellipse cx="15" cy="9.6" fill="var(--forest-canopy-pine)" rx="3.2" ry="2.2" />
      </symbol>

      <symbol id={SPRITE_ID.log} viewBox="0 0 16 16">
        <ellipse cx="8" cy="13.6" fill="var(--forest-shadow)" rx="6" ry="1.2" />
        <rect fill="var(--forest-bark)" height="2.6" rx="1.1" width="11.2" x="2.4" y="10.6" />
        <rect fill="var(--forest-bark-dark)" height="2.6" width="1.4" x="2.4" y="10.6" />
        <rect fill="var(--forest-wood-light)" height="1" width="6" x="5.2" y="11" />
      </symbol>

      <symbol id={SPRITE_ID.rock} viewBox="0 0 16 16">
        <ellipse cx="8" cy="14.6" fill="var(--forest-shadow)" rx="5" ry="1.2" />
        <ellipse cx="8" cy="11.2" fill="var(--forest-rock)" rx="5.2" ry="3.4" />
        <ellipse cx="8.4" cy="9.4" fill="var(--forest-rock)" rx="3.2" ry="2.2" />
        <ellipse cx="6.2" cy="10.4" fill="var(--forest-rock-light)" rx="2" ry="1.2" />
      </symbol>

      <symbol id={SPRITE_ID.stump} viewBox="0 0 16 16">
        <ellipse cx="8" cy="14.6" fill="var(--forest-shadow)" rx="4.4" ry="1.1" />
        <rect fill="var(--forest-bark-dark)" height="4" width="6.4" x="4.8" y="10.4" />
        <ellipse cx="8" cy="10.4" fill="var(--forest-bark)" rx="3.2" ry="1.1" />
        <ellipse cx="8" cy="10.2" fill="var(--forest-wood-light)" rx="2" ry="0.55" />
      </symbol>

      <symbol id={SPRITE_ID.bloom} viewBox="0 0 16 16">
        <circle cx="5.4" cy="9.4" fill="var(--forest-bloom)" r="1.5" />
        <circle cx="9.4" cy="11" fill="var(--forest-bloom-alt)" r="1.3" />
        <circle cx="8" cy="7.4" fill="var(--forest-bloom)" r="1.1" />
      </symbol>

      <symbol id={SPRITE_ID.reed} viewBox="0 0 16 16">
        <rect fill="var(--forest-canopy-light)" height="7.2" rx="0.5" width="1" x="5.2" y="7.4" />
        <rect fill="var(--forest-canopy-light)" height="8.6" rx="0.5" width="1" x="7.6" y="6" />
        <rect fill="var(--forest-canopy)" height="6.2" rx="0.5" width="1" x="9.8" y="8.2" />
        <ellipse cx="5.7" cy="7.2" fill="var(--forest-canopy)" rx="1.1" ry="0.7" />
        <ellipse cx="8.1" cy="5.8" fill="var(--forest-canopy)" rx="1.1" ry="0.7" />
      </symbol>

      <symbol id={CRITTER_ID.fish} viewBox="0 0 24 16">
        <ellipse
          cx="12"
          cy="8.4"
          fill="light-dark(hsl(200deg 50% 62%), hsl(196deg 40% 48%))"
          rx="5.4"
          ry="2.4"
        />
        <polygon
          fill="light-dark(hsl(32deg 70% 70%), hsl(32deg 50% 50%))"
          points="17.2,8.4 21.4,5.6 21.4,11.2"
        />
        <circle cx="8.4" cy="7.8" fill="var(--forest-surf)" r="0.7" />
      </symbol>

      <symbol id={CRITTER_ID.rabbit} viewBox="0 0 24 16">
        <ellipse cx="12" cy="14.6" fill="var(--forest-shadow)" rx="4.4" ry="1" />
        <ellipse
          cx="11.4"
          cy="11.4"
          fill="light-dark(hsl(30deg 20% 74%), hsl(30deg 12% 44%))"
          rx="4.2"
          ry="2.8"
        />
        <ellipse
          cx="15.4"
          cy="9.6"
          fill="light-dark(hsl(30deg 20% 80%), hsl(30deg 12% 52%))"
          rx="2.2"
          ry="1.8"
        />
        <ellipse
          cx="14.6"
          cy="5.4"
          fill="light-dark(hsl(30deg 18% 64%), hsl(30deg 10% 36%))"
          rx="0.7"
          ry="2.6"
        />
        <ellipse
          cx="16.4"
          cy="5.8"
          fill="light-dark(hsl(30deg 18% 64%), hsl(30deg 10% 36%))"
          rx="0.7"
          ry="2.2"
        />
        <circle cx="16.4" cy="9.2" fill="var(--forest-bark-dark)" r="0.45" />
      </symbol>

      <symbol id={CRITTER_ID.fox} viewBox="0 0 24 16">
        <ellipse cx="12" cy="14.7" fill="var(--forest-shadow)" rx="5.2" ry="1" />
        <ellipse
          cx="11"
          cy="11.2"
          fill="light-dark(hsl(24deg 72% 48%), hsl(24deg 55% 38%))"
          rx="5.6"
          ry="2.5"
        />
        <ellipse
          cx="17.2"
          cy="9.4"
          fill="light-dark(hsl(24deg 72% 48%), hsl(24deg 55% 38%))"
          rx="2.4"
          ry="1.8"
        />
        <polygon
          fill="light-dark(hsl(36deg 40% 88%), hsl(36deg 20% 70%))"
          points="5.2,11.6 8.4,13.6 5.6,13.8"
        />
        <polygon
          fill="light-dark(hsl(24deg 60% 36%), hsl(24deg 40% 24%))"
          points="18.4,7.6 20.6,3.8 19.2,8.4"
        />
        <circle cx="18.4" cy="8.8" fill="var(--forest-bark-dark)" r="0.45" />
      </symbol>

      <symbol id={CRITTER_ID.deer} viewBox="0 0 24 16">
        <ellipse cx="11.5" cy="14.8" fill="var(--forest-shadow)" rx="6.2" ry="1.1" />
        <rect
          fill="light-dark(hsl(28deg 30% 28%), hsl(28deg 20% 18%))"
          height="4.4"
          width="1.15"
          x="6.2"
          y="10.8"
        />
        <rect
          fill="light-dark(hsl(28deg 30% 28%), hsl(28deg 20% 18%))"
          height="4.4"
          width="1.15"
          x="8.6"
          y="10.8"
        />
        <rect
          fill="light-dark(hsl(28deg 30% 28%), hsl(28deg 20% 18%))"
          height="4.2"
          width="1.15"
          x="12.4"
          y="11"
        />
        <rect
          fill="light-dark(hsl(28deg 30% 28%), hsl(28deg 20% 18%))"
          height="4.2"
          width="1.15"
          x="14.6"
          y="11"
        />
        <ellipse
          cx="11"
          cy="10"
          fill="light-dark(hsl(28deg 38% 42%), hsl(28deg 24% 28%))"
          rx="6.4"
          ry="2.8"
        />
        <rect
          fill="light-dark(hsl(28deg 38% 42%), hsl(28deg 24% 28%))"
          height="3.2"
          width="1.8"
          x="16.2"
          y="5.8"
        />
        <ellipse
          cx="18.4"
          cy="5.6"
          fill="light-dark(hsl(28deg 38% 42%), hsl(28deg 24% 28%))"
          rx="2"
          ry="1.6"
        />
        <rect fill="var(--forest-bark-dark)" height="3.2" width="0.7" x="17.4" y="1.2" />
        <rect fill="var(--forest-bark-dark)" height="2.4" width="0.7" x="16.4" y="1.6" />
        <rect fill="var(--forest-bark-dark)" height="3.2" width="0.7" x="19.2" y="1.2" />
        <rect fill="var(--forest-bark-dark)" height="2.2" width="0.7" x="20.2" y="1.8" />
        <circle cx="19.4" cy="5.2" fill="var(--forest-bark-dark)" r="0.4" />
      </symbol>

      <symbol id={CRITTER_ID.bird} viewBox="0 0 24 16">
        <polygon
          fill="light-dark(hsl(220deg 18% 28%), hsl(220deg 12% 70%))"
          points="2,9 11,7.4 11,9.8"
        />
        <polygon
          fill="light-dark(hsl(220deg 18% 28%), hsl(220deg 12% 70%))"
          points="13,7.4 22,9 13,9.8"
        />
        <ellipse
          cx="12"
          cy="8.4"
          fill="light-dark(hsl(220deg 16% 22%), hsl(220deg 10% 80%))"
          rx="2.2"
          ry="1.5"
        />
        <polygon fill="var(--forest-bloom-alt)" points="14.2,8.2 16.4,7.8 14.2,8.8" />
      </symbol>
    </defs>
  );
}
