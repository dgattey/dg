import { Minus, Plus, Shrink } from 'lucide-react';
import type { MouseEvent } from 'react';

type ZoomControlsProps = {
  onReset?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};

const containerInteractionProps = {
  onMouseDown: stopPropagation,
  onMouseUp: stopPropagation,
};

export function ZoomControls({ onReset, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div {...containerInteractionProps} data-zoom-controls="">
      <button
        aria-label="Zoom in"
        data-typography="title-sm"
        data-zoom-button=""
        onClick={onZoomIn}
        type="button"
      >
        <Plus aria-hidden="true" size="1em" />
      </button>
      <button
        aria-label="Zoom out"
        data-typography="title-sm"
        data-zoom-button=""
        onClick={onZoomOut}
        type="button"
      >
        <Minus aria-hidden="true" size="1em" />
      </button>
      {onReset ? (
        <button
          aria-label="Reset view"
          data-typography="title-sm"
          data-zoom-button=""
          onClick={onReset}
          type="button"
        >
          <Shrink aria-hidden="true" size="0.8em" />
        </button>
      ) : null}
    </div>
  );
}
