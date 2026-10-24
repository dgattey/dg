import { Minus, Plus, Shrink } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';

type ZoomControlsProps = {
  onReset?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

const containerStyle: CSSProperties = {
  display: 'grid',
  gap: '5px',
  position: 'absolute',
  right: 12,
  top: 12,
  zIndex: 2,
};

const ZOOM_CONTROLS_CSS = `
[data-zoom-button] {
  align-items: center;
  background-color: var(--cream);
  border: 0;
  clip-path: var(--quad-b);
  color: var(--ink-on-cream);
  cursor: pointer;
  display: flex;
  font-size: 17px;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 28px;
}
[data-zoom-button]:hover {
  background-color: color-mix(in srgb, var(--cream) 86%, var(--ochre));
}
[data-zoom-button]:focus-visible {
  border-radius: 9px 13px 10px 12px;
  outline: 2px solid currentColor;
  outline-offset: -3px;
}
`;

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};

const containerInteractionProps = {
  onMouseDown: stopPropagation,
  onMouseUp: stopPropagation,
};

export function ZoomControls({ onReset, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div {...containerInteractionProps} style={containerStyle}>
      <style href="dg-zoom-controls" precedence="default">
        {ZOOM_CONTROLS_CSS}
      </style>
      <button aria-label="Zoom in" data-zoom-button="" onClick={onZoomIn} type="button">
        <Plus aria-hidden="true" size="1em" />
      </button>
      <button aria-label="Zoom out" data-zoom-button="" onClick={onZoomOut} type="button">
        <Minus aria-hidden="true" size="1em" />
      </button>
      {onReset ? (
        <button aria-label="Reset view" data-zoom-button="" onClick={onReset} type="button">
          <Shrink aria-hidden="true" size="0.8em" />
        </button>
      ) : null}
    </div>
  );
}
