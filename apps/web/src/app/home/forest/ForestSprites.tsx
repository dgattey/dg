import type { CritterKind, SceneryKind } from './forestMap';

export const SPRITE_ID: Record<SceneryKind, string> = {
  birch: 'forest-birch',
  bloom: 'forest-bloom',
  bush: 'forest-bush',
  oak: 'forest-oak',
  pine: 'forest-pine',
  reed: 'forest-reed',
  rock: 'forest-rock',
  willow: 'forest-willow',
};

export const CRITTER_ID: Record<CritterKind, string> = {
  bird: 'forest-bird',
  rabbit: 'forest-rabbit',
};

export const SPRITE_VIEWBOX: Record<SceneryKind, string> = {
  birch: '0 0 24 32',
  bloom: '0 0 16 16',
  bush: '0 0 24 18',
  oak: '0 0 24 32',
  pine: '0 0 24 32',
  reed: '0 0 16 16',
  rock: '0 0 16 16',
  willow: '0 0 24 32',
};

export const CRITTER_VIEWBOX: Record<CritterKind, string> = {
  bird: '0 0 24 16',
  rabbit: '0 0 24 16',
};

export const SPRITE_SCALE: Record<SceneryKind, { height: number; width: number }> = {
  birch: { height: 3.15, width: 1.8 },
  bloom: { height: 0.85, width: 0.85 },
  bush: { height: 1.25, width: 1.9 },
  oak: { height: 3, width: 2.65 },
  pine: { height: 3.5, width: 2.05 },
  reed: { height: 1.55, width: 1.05 },
  rock: { height: 1, width: 1.35 },
  willow: { height: 2.85, width: 3 },
};

export const CRITTER_SCALE: Record<CritterKind, { height: number; width: number }> = {
  bird: { height: 0.45, width: 0.85 },
  rabbit: { height: 0.45, width: 0.6 },
};

export const WINDY_KINDS: ReadonlySet<SceneryKind> = new Set<SceneryKind>([
  'birch',
  'bush',
  'oak',
  'pine',
  'reed',
  'willow',
]);

function SoftShadow({
  cx = 12,
  cy = 30.5,
  rx = 6.4,
  ry = 1.25,
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
      <rect fill="var(--forest-bark)" height={height} rx={0.6} width={width} x={x} y={y} />
      <rect
        fill="var(--forest-wood-light)"
        height={height}
        rx={0.4}
        width={width * 0.35}
        x={x}
        y={y}
      />
    </>
  );
}

export function ForestSpriteDefs() {
  return (
    <defs>
      <symbol id={SPRITE_ID.pine} viewBox="0 0 24 32">
        <SoftShadow />
        <Trunk height={7} width={2} x={11} y={23.4} />
        <ellipse cx="12" cy="22.4" fill="var(--forest-canopy-pine)" rx="8.2" ry="4.2" />
        <ellipse cx="12" cy="17.2" fill="var(--forest-canopy-pine)" rx="6.6" ry="4" />
        <ellipse cx="12" cy="12.2" fill="var(--forest-canopy-pine)" rx="5" ry="3.6" />
        <ellipse cx="12" cy="7.6" fill="var(--forest-canopy-pine)" rx="3.4" ry="3.2" />
        <ellipse cx="10.2" cy="20.8" fill="var(--forest-canopy-pine-light)" rx="3.4" ry="2.2" />
        <ellipse cx="10.4" cy="15.8" fill="var(--forest-canopy-pine-light)" rx="2.8" ry="2" />
        <ellipse cx="10.6" cy="11.2" fill="var(--forest-canopy-pine-light)" rx="2.2" ry="1.7" />
        <ellipse cx="11.2" cy="6.6" fill="var(--forest-canopy-pine-light)" rx="1.6" ry="1.5" />
      </symbol>

      <symbol id={SPRITE_ID.oak} viewBox="0 0 24 32">
        <SoftShadow rx={7.6} />
        <Trunk height={9} width={2.8} x={10.6} y={20.8} />
        <ellipse cx="12" cy="14.2" fill="var(--forest-canopy)" rx="9.2" ry="7.4" />
        <ellipse cx="5.2" cy="15.8" fill="var(--forest-canopy)" rx="5" ry="4.2" />
        <ellipse cx="18.8" cy="16.2" fill="var(--forest-canopy)" rx="4.6" ry="3.8" />
        <ellipse cx="12.4" cy="8" fill="var(--forest-canopy)" rx="5.6" ry="4.2" />
        <ellipse cx="7.4" cy="10" fill="var(--forest-canopy-light)" rx="4" ry="3" />
        <ellipse cx="15.2" cy="10.6" fill="var(--forest-canopy-light)" rx="3.4" ry="2.6" />
        <ellipse cx="11.6" cy="12.4" fill="var(--forest-canopy-light)" rx="2.4" ry="1.8" />
      </symbol>

      <symbol id={SPRITE_ID.birch} viewBox="0 0 24 32">
        <SoftShadow rx={5.6} />
        <rect fill="var(--forest-paper)" height={15.4} rx={0.5} width={2} x={11} y={15} />
        <rect fill="var(--forest-paper-edge)" height={15.4} width={0.55} x={12.45} y={15} />
        <rect fill="var(--forest-bark-dark)" height={1} width={2} x={11} y={18.2} />
        <rect fill="var(--forest-bark-dark)" height={0.85} width={2} x={11} y={22.4} />
        <rect fill="var(--forest-bark-dark)" height={0.75} width={2} x={11} y={26.4} />
        <ellipse cx="12" cy="11.4" fill="var(--forest-canopy-light)" rx="7.2" ry="6" />
        <ellipse cx="12" cy="7.8" fill="var(--forest-canopy)" rx="4.2" ry="3.2" />
        <ellipse cx="8.4" cy="11.2" fill="var(--forest-meadow)" rx="2.4" ry="1.6" />
      </symbol>

      <symbol id={SPRITE_ID.willow} viewBox="0 0 24 32">
        <SoftShadow cx={11.4} rx={8} />
        <polygon fill="var(--forest-bark)" points="14.6,31 16.2,31 11.4,12.2 9.8,12.2" />
        <ellipse cx="10.6" cy="11.2" fill="var(--forest-canopy)" rx="6.2" ry="4.2" />
        <ellipse cx="5.4" cy="18.2" fill="var(--forest-canopy-light)" rx="2" ry="8.2" />
        <ellipse cx="8.4" cy="19.4" fill="var(--forest-canopy-light)" rx="1.9" ry="8.8" />
        <ellipse cx="11.4" cy="18.8" fill="var(--forest-canopy)" rx="2.1" ry="8" />
        <ellipse cx="14.4" cy="20" fill="var(--forest-canopy-light)" rx="1.8" ry="7.4" />
        <ellipse cx="17.2" cy="21" fill="var(--forest-canopy-light)" rx="1.6" ry="6.2" />
      </symbol>

      <symbol id={SPRITE_ID.bush} viewBox="0 0 24 18">
        <SoftShadow cx={12} cy={16.3} rx={7.4} ry={1.1} />
        <ellipse cx="12" cy="11.2" fill="var(--forest-canopy)" rx="9.2" ry="5.4" />
        <ellipse cx="6.6" cy="12.4" fill="var(--forest-canopy)" rx="4.4" ry="3.4" />
        <ellipse cx="17.4" cy="12.6" fill="var(--forest-canopy)" rx="4" ry="3.2" />
        <ellipse cx="9.4" cy="9.2" fill="var(--forest-canopy-light)" rx="3.8" ry="2.6" />
        <ellipse cx="14.8" cy="9.6" fill="var(--forest-canopy-pine)" rx="3" ry="2.1" />
      </symbol>

      <symbol id={SPRITE_ID.rock} viewBox="0 0 16 16">
        <SoftShadow cx={8} cy={14.5} rx={4.6} ry={1} />
        <ellipse cx="8" cy="11.2" fill="var(--forest-rock)" rx="5" ry="3.2" />
        <ellipse cx="8.4" cy="9.6" fill="var(--forest-rock)" rx="3" ry="2" />
        <ellipse cx="6.4" cy="10.4" fill="var(--forest-rock-light)" rx="1.9" ry="1.1" />
      </symbol>

      <symbol id={SPRITE_ID.bloom} viewBox="0 0 16 16">
        <ellipse cx="5.6" cy="10.2" fill="var(--forest-bloom)" rx="1.5" ry="1.1" />
        <ellipse cx="9.6" cy="11.4" fill="var(--forest-bloom-alt)" rx="1.3" ry="1" />
        <ellipse cx="8" cy="8.2" fill="var(--forest-meadow)" rx="1.2" ry="0.9" />
      </symbol>

      <symbol id={SPRITE_ID.reed} viewBox="0 0 16 16">
        <rect
          fill="var(--forest-canopy-light)"
          height={7.4}
          rx={0.45}
          width={0.85}
          x={5.4}
          y={7.2}
        />
        <rect
          fill="var(--forest-canopy-light)"
          height={8.8}
          rx={0.45}
          width={0.85}
          x={7.8}
          y={5.8}
        />
        <rect fill="var(--forest-canopy)" height={6.4} rx={0.45} width={0.85} x={10} y={8} />
        <ellipse cx="5.8" cy="7" fill="var(--forest-canopy)" rx="1.05" ry="0.65" />
        <ellipse cx="8.2" cy="5.6" fill="var(--forest-canopy)" rx="1.05" ry="0.65" />
      </symbol>

      <symbol id={CRITTER_ID.rabbit} viewBox="0 0 24 16">
        <ellipse cx={13.2} cy={13.8} fill="var(--forest-shadow)" rx={2.4} ry={0.7} />
        <polygon fill="var(--forest-bark)" points="9.6,12.8 12.2,10.4 15.4,12.8" />
        <rect fill="var(--forest-bark)" height={2.4} width={0.55} x={13.4} y={7.8} />
        <rect fill="var(--forest-bark)" height={2} width={0.55} x={14.4} y={8.2} />
      </symbol>

      <symbol id={CRITTER_ID.bird} viewBox="0 0 24 16">
        <polygon fill="var(--forest-bark-dark)" points="6.2,8.4 12,7.2 17.8,8.4 12,8.9" />
      </symbol>
    </defs>
  );
}
