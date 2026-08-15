import type { CritterKind, SceneryKind } from './forestMap';

/**
 * Scenery drawn once into `<defs>` and stamped with `<use>`.
 *
 * Mass and silhouette first. Every volume has a lit northwest face and a dark
 * southeast face under one sun. Fruit-dot trees, three-circle canopies, and
 * cartoon faces are not in this set. Critters are ticks and four-leg bars.
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
  bird: { height: 0.45, width: 0.85 },
  deer: { height: 0.85, width: 1.35 },
  fish: { height: 0.35, width: 0.7 },
  fox: { height: 0.55, width: 0.95 },
  rabbit: { height: 0.45, width: 0.6 },
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

function ContactShadow({
  cx = 13.1,
  cy = 30.5,
  rx = 6.2,
  ry = 1.15,
}: {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
}) {
  return <ellipse cx={cx} cy={cy} fill="var(--forest-shadow)" rx={rx} ry={ry} />;
}

function Trunk({
  x = 10.8,
  y = 21,
  height = 9,
  width = 2.4,
}: {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}) {
  return (
    <>
      <rect fill="var(--forest-bark-dark)" height={height} width={width} x={x} y={y} />
      <rect fill="var(--forest-bark)" height={height} width={width * 0.42} x={x} y={y} />
    </>
  );
}

export function ForestSpriteDefs() {
  return (
    <defs>
      <symbol id={SPRITE_ID.pine} viewBox="0 0 24 32">
        <ContactShadow />
        <Trunk height={7.2} width={2} x={11} y={23.2} />
        <polygon fill="var(--forest-canopy-pine)" points="12,2.4 6.2,11.6 17.8,11.6" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,2.4 6.2,11.6 12,11.6" />
        <polygon fill="var(--forest-canopy-pine)" points="12,7.2 4.2,17.8 19.8,17.8" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,7.2 4.2,17.8 12,17.8" />
        <polygon fill="var(--forest-canopy-pine)" points="12,13 2.4,25.6 21.6,25.6" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,13 2.4,25.6 12,25.6" />
        <polygon fill="var(--forest-bark-dark)" points="12,13 21.6,25.6 16.4,25.6" />
      </symbol>

      <symbol id={SPRITE_ID.cedar} viewBox="0 0 24 32">
        <ContactShadow cx={13} cy={30.6} rx={5.2} />
        <Trunk height={5.6} width={1.5} x={11.25} y={25} />
        <polygon fill="var(--forest-canopy-cedar)" points="12,1.2 8.6,8.8 15.4,8.8" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,1.2 8.6,8.8 12,8.8" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,5.4 7.4,14.2 16.6,14.2" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,5.4 7.4,14.2 12,14.2" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,11 6.4,20.4 17.6,20.4" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,11 6.4,20.4 12,20.4" />
        <polygon fill="var(--forest-canopy-cedar)" points="12,17 5.6,27.2 18.4,27.2" />
        <polygon fill="var(--forest-canopy-pine-light)" points="12,17 5.6,27.2 12,27.2" />
      </symbol>

      <symbol id={SPRITE_ID.oak} viewBox="0 0 24 32">
        <ContactShadow cx={13.2} cy={30.5} rx={7.4} />
        <Trunk height={9.2} width={2.8} x={10.6} y={20.6} />
        <polygon
          fill="var(--forest-canopy)"
          points="12,4.2 6.4,6.8 2.8,12.4 3.6,18.8 8.2,22.4 15.8,22.6 20.8,18.2 21.2,11.6 17.4,6.2"
        />
        <polygon
          fill="var(--forest-canopy-light)"
          points="12,4.2 6.4,6.8 2.8,12.4 5.2,13.2 12,12.6 12,4.2"
        />
        <polygon
          fill="var(--forest-bark-dark)"
          points="8.2,22.4 15.8,22.6 20.8,18.2 16.4,19.6 12,21.2"
        />
      </symbol>

      <symbol id={SPRITE_ID.maple} viewBox="0 0 24 32">
        <ContactShadow cx={13.3} cy={30.5} rx={7} />
        <Trunk height={8.4} width={2.4} x={10.8} y={21.4} />
        <polygon
          fill="var(--forest-canopy-maple)"
          points="12,3.8 7.6,6.4 3.2,10.8 4.4,16.6 7.2,20.8 12,22.2 16.8,20.4 20.6,16 20.2,10.2 16.4,6"
        />
        <polygon
          fill="var(--forest-canopy-maple-light)"
          points="12,3.8 7.6,6.4 3.2,10.8 6.4,11.4 12,10.8"
        />
        <polygon fill="var(--forest-bark-dark)" points="7.2,20.8 12,22.2 16.8,20.4 12,19.4" />
      </symbol>

      <symbol id={SPRITE_ID.birch} viewBox="0 0 24 32">
        <ContactShadow cx={13} cy={30.5} rx={5.6} />
        <rect fill="var(--forest-paper-edge)" height={15.2} width={2} x={11} y={15.2} />
        <rect fill="var(--forest-paper)" height={15.2} width={0.7} x={11} y={15.2} />
        <rect fill="var(--forest-bark-dark)" height={1.1} width={2} x={11} y={18.4} />
        <rect fill="var(--forest-bark-dark)" height={0.9} width={2} x={11} y={22.6} />
        <rect fill="var(--forest-bark-dark)" height={0.8} width={2} x={11} y={26.6} />
        <polygon
          fill="var(--forest-canopy)"
          points="12,4.6 7.2,8.2 5.4,13.6 8.8,17.2 15.2,17 18.4,13 16.8,7.8"
        />
        <polygon fill="var(--forest-canopy-light)" points="12,4.6 7.2,8.2 5.4,13.6 12,12.8" />
      </symbol>

      <symbol id={SPRITE_ID.willow} viewBox="0 0 24 32">
        <ContactShadow cx={12.4} cy={30.6} rx={8} />
        <polygon fill="var(--forest-bark-dark)" points="15.2,31 16.6,31 11.8,12.2 10.2,12.2" />
        <polygon fill="var(--forest-bark)" points="10.2,12.2 11.8,12.2 11.2,31 10.4,31" />
        <polygon
          fill="var(--forest-canopy)"
          points="4.2,10.4 10.6,7.2 16.8,9.6 15.4,13.2 5.8,13.6"
        />
        <polygon fill="var(--forest-canopy-light)" points="4.2,10.4 10.6,7.2 10.6,13.4" />
        <polygon fill="var(--forest-canopy)" points="4.6,13.2 6.4,13.2 5.4,26.8 3.8,26.4" />
        <polygon fill="var(--forest-canopy-light)" points="7.6,13.4 9.2,13.4 8.4,27.6 6.8,27.2" />
        <polygon fill="var(--forest-canopy)" points="10.6,13.2 12.4,13.2 11.8,26.2 10.2,25.8" />
        <polygon
          fill="var(--forest-canopy-light)"
          points="13.6,13.4 15.2,13.6 14.8,27.4 13.2,26.8"
        />
        <polygon fill="var(--forest-canopy)" points="16.2,13.6 17.6,14 17.4,25.6 15.8,25.2" />
      </symbol>

      <symbol id={SPRITE_ID.dead} viewBox="0 0 24 32">
        <ContactShadow cx={13} cy={30.5} rx={5.4} />
        <rect fill="var(--forest-bark-dark)" height={17.6} width={1.6} x={11.2} y={12.8} />
        <rect fill="var(--forest-bark)" height={17.6} width={0.55} x={11.2} y={12.8} />
        <polygon fill="var(--forest-bark-dark)" points="12,14.2 3.8,8.4 4.6,7.6 12,12.4" />
        <polygon fill="var(--forest-bark)" points="12.6,16.2 20.6,9.6 21.2,10.4 13.2,17.2" />
        <polygon fill="var(--forest-bark)" points="12,10.2 8.4,4.4 9.1,3.8 12.6,9.6" />
      </symbol>

      <symbol id={SPRITE_ID.fruit} viewBox="0 0 24 32">
        <ContactShadow cx={13.2} cy={30.5} rx={7.2} />
        <Trunk height={8.6} width={2.2} x={10.9} y={21.2} />
        <polygon
          fill="var(--forest-canopy)"
          points="12,5.2 6.8,8 3.6,13.4 5,19.2 10.2,22 14.4,21.6 19.6,17.8 20.4,12.2 17.2,7.2"
        />
        <polygon fill="var(--forest-canopy-light)" points="12,5.2 6.8,8 3.6,13.4 12,13" />
        <polygon fill="var(--forest-bark-dark)" points="5,19.2 10.2,22 14.4,21.6 12,18.8" />
      </symbol>

      <symbol id={SPRITE_ID.bush} viewBox="0 0 24 18">
        <ContactShadow cx={13} cy={16.4} rx={7.2} ry={1.05} />
        <polygon fill="var(--forest-canopy)" points="3.2,14.8 6.4,8.4 12,6.6 17.8,8.8 20.8,14.8" />
        <polygon fill="var(--forest-canopy-light)" points="3.2,14.8 6.4,8.4 12,6.6 12,14.8" />
        <polygon fill="var(--forest-canopy-pine)" points="8.4,14.8 12,10.2 16.8,14.8" />
      </symbol>

      <symbol id={SPRITE_ID.log} viewBox="0 0 16 16">
        <ContactShadow cx={9.2} cy={13.6} rx={5.4} ry={1} />
        <rect fill="var(--forest-bark-dark)" height={2.4} width={11} x={2.6} y={10.6} />
        <rect fill="var(--forest-bark)" height={2.4} width={4.2} x={2.6} y={10.6} />
        <rect fill="var(--forest-wood-dark)" height={2.4} width={1.2} x={2.6} y={10.6} />
      </symbol>

      <symbol id={SPRITE_ID.rock} viewBox="0 0 16 16">
        <ContactShadow cx={9.2} cy={14.5} rx={4.6} ry={1} />
        <polygon fill="var(--forest-rock)" points="3.2,13.6 5.4,8.8 10.2,7.4 13.6,10.2 12.8,13.8" />
        <polygon fill="var(--forest-rock-light)" points="3.2,13.6 5.4,8.8 10.2,7.4 8.2,13.6" />
        <polygon fill="var(--forest-bloom)" points="10.2,7.4 13.6,10.2 11.4,10.6" />
      </symbol>

      <symbol id={SPRITE_ID.stump} viewBox="0 0 16 16">
        <ContactShadow cx={9} cy={14.5} rx={4} ry={0.95} />
        <rect fill="var(--forest-bark-dark)" height={3.8} width={5.8} x={5.1} y={10.4} />
        <rect fill="var(--forest-bark)" height={3.8} width={2} x={5.1} y={10.4} />
        <polygon fill="var(--forest-wood)" points="5.1,10.4 8,9.4 10.9,10.4 8,11.2" />
        <polygon fill="var(--forest-wood-light)" points="5.1,10.4 8,9.4 8,11.2" />
      </symbol>

      <symbol id={SPRITE_ID.bloom} viewBox="0 0 16 16">
        <polygon fill="var(--forest-bloom)" points="4.2,11.2 6.2,8.6 8.4,11.2" />
        <polygon fill="var(--forest-bloom-alt)" points="8.6,12.2 10.2,10.2 12.2,12.4" />
        <polygon fill="var(--forest-canopy)" points="7.2,8.8 8.4,7.2 9.6,8.8" />
      </symbol>

      <symbol id={SPRITE_ID.reed} viewBox="0 0 16 16">
        <rect fill="var(--forest-canopy)" height={7.4} width={0.7} x={5.4} y={7.2} />
        <rect fill="var(--forest-canopy-light)" height={8.8} width={0.7} x={7.8} y={5.8} />
        <rect fill="var(--forest-canopy)" height={6.4} width={0.7} x={10} y={8} />
        <polygon fill="var(--forest-canopy-pine)" points="5.1,7.2 5.75,5.8 6.4,7.2" />
        <polygon fill="var(--forest-canopy-pine)" points="7.5,5.8 8.15,4.4 8.8,5.8" />
      </symbol>

      <symbol id={CRITTER_ID.fish} viewBox="0 0 24 16">
        <polygon fill="var(--forest-steel)" points="6.4,8.2 14.8,6.8 14.8,9.6" />
        <polygon fill="var(--forest-bark-dark)" points="14.8,8.2 18.6,6.6 18.6,9.8" />
      </symbol>

      <symbol id={CRITTER_ID.rabbit} viewBox="0 0 24 16">
        <ellipse cx={13.2} cy={13.8} fill="var(--forest-shadow)" rx={2.4} ry={0.7} />
        <polygon fill="var(--forest-bark-dark)" points="9.6,12.8 12.2,10.4 15.4,12.8" />
        <rect fill="var(--forest-bark-dark)" height={2.4} width={0.55} x={13.4} y={7.8} />
        <rect fill="var(--forest-bark-dark)" height={2} width={0.55} x={14.4} y={8.2} />
      </symbol>

      <symbol id={CRITTER_ID.fox} viewBox="0 0 24 16">
        <ellipse cx={13} cy={13.8} fill="var(--forest-shadow)" rx={3.2} ry={0.7} />
        <rect fill="var(--forest-bark-dark)" height={1.6} width={6.4} x={8.4} y={10.4} />
        <rect fill="var(--forest-bark-dark)" height={2.2} width={0.55} x={9} y={11.4} />
        <rect fill="var(--forest-bark-dark)" height={2.2} width={0.55} x={10.6} y={11.4} />
        <rect fill="var(--forest-bark-dark)" height={2.2} width={0.55} x={13.2} y={11.4} />
        <rect fill="var(--forest-bark-dark)" height={2.2} width={0.55} x={14.6} y={11.4} />
      </symbol>

      <symbol id={CRITTER_ID.deer} viewBox="0 0 24 16">
        <ellipse cx={12.6} cy={14} fill="var(--forest-shadow)" rx={4} ry={0.75} />
        <rect fill="var(--forest-bark-dark)" height={1.8} width={7.6} x={7.2} y={9.6} />
        <rect fill="var(--forest-bark-dark)" height={3.4} width={0.55} x={8} y={10.4} />
        <rect fill="var(--forest-bark-dark)" height={3.4} width={0.55} x={9.6} y={10.4} />
        <rect fill="var(--forest-bark-dark)" height={3.2} width={0.55} x={12.6} y={10.6} />
        <rect fill="var(--forest-bark-dark)" height={3.2} width={0.55} x={14.2} y={10.6} />
        <rect fill="var(--forest-bark-dark)" height={2.2} width={0.5} x={14.6} y={7.2} />
      </symbol>

      <symbol id={CRITTER_ID.bird} viewBox="0 0 24 16">
        <polygon fill="var(--forest-bark-dark)" points="6.2,8.4 12,7.2 17.8,8.4 12,8.9" />
      </symbol>
    </defs>
  );
}
