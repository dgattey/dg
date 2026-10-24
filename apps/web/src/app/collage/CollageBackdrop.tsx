import type { CSSProperties } from 'react';
import type { Backdrop, SheetPlacement } from './backdrops';
import { CutOut } from './CutOut';

type SheetStyle = CSSProperties & {
  '--sheet-a': string;
  '--sheet-b': string;
  '--sheet-h'?: string;
  '--sheet-rotation': string;
  '--sheet-size'?: string;
  '--sheet-w'?: string;
  '--sheet-x': string;
  '--sheet-y': string;
};

function Sheet({ sheet }: { sheet: SheetPlacement }) {
  const style: SheetStyle = {
    '--sheet-a': `var(--${sheet.tone})`,
    '--sheet-b': `var(--${sheet.accent ?? sheet.tone})`,
    '--sheet-rotation': `${sheet.rotationDeg}deg`,
    '--sheet-x': `${sheet.xPercent}%`,
    '--sheet-y': `${sheet.yPercent}%`,
    ...(sheet.edge === 'torn'
      ? { '--sheet-h': `${sheet.heightPx}px`, '--sheet-w': `${sheet.widthPercent}%` }
      : { '--sheet-size': `${sheet.sizePx}px` }),
  };
  const desktopOnly = sheet.visibility === 'desktop' ? ' collageSheetDesktopOnly' : '';
  return (
    <span
      className={`collageField collageBackdropSheet collageSheet-${sheet.pattern} collageSheetEdge-${sheet.edge}${desktopOnly}`}
      data-sheet={sheet.id}
      style={style}
    />
  );
}

export function CollageBackdrop({ backdrop }: { backdrop: Backdrop }) {
  const fill = backdrop.bandHeightPx === 'fill';
  const style = fill ? undefined : ({ '--band-h': `${backdrop.bandHeightPx}px` } as CSSProperties);
  const bands = Array.from({ length: backdrop.repeat }, (_, slot) => ({
    band: backdrop.bands[slot % backdrop.bands.length],
    slot: `band-${slot}`,
  }));
  return (
    <div aria-hidden="true" className="collageBackdrop" data-fill={fill || undefined} style={style}>
      {bands.map(({ band, slot }) =>
        band ? (
          <div className="collageBand" key={slot}>
            {band.sheets.map((sheet) => (
              <Sheet key={sheet.id} sheet={sheet} />
            ))}
            {band.cutOuts.map((placement) => (
              <CutOut key={placement.id} placement={placement} />
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}
