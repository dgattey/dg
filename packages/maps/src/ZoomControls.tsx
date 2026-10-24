import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { Minus, Plus, Shrink } from 'lucide-react';
import type { MouseEvent } from 'react';

type ZoomControlsProps = {
  onReset?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

const containerSx: SxObject = {
  display: 'grid',
  gap: '5px',
  position: 'absolute',
  right: 12,
  top: 12,
  zIndex: 2,
};

const buttonSx: SxObject = {
  ':hover': {
    backgroundColor: 'color-mix(in srgb, var(--cream) 86%, var(--ochre))',
  },
  // The quad clip-path cuts anything drawn outside the button, so the ring sits inside.
  '&&:focus-visible': {
    borderRadius: '9px 13px 10px 12px',
    outline: '2px solid currentColor',
    outlineOffset: '-3px',
  },
  alignItems: 'center',
  backgroundColor: 'var(--cream)',
  border: 0,
  clipPath: 'var(--quad-b)',
  color: 'var(--ink-on-cream)',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 17,
  fontWeight: 700,
  height: 28,
  justifyContent: 'center',
  padding: 0,
  width: 28,
};

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};

export function ZoomControls({ onReset, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <Box onMouseDown={stopPropagation} onMouseUp={stopPropagation} sx={containerSx}>
      <Box aria-label="Zoom in" component="button" onClick={onZoomIn} sx={buttonSx} type="button">
        <Plus aria-hidden="true" size="1em" />
      </Box>
      <Box aria-label="Zoom out" component="button" onClick={onZoomOut} sx={buttonSx} type="button">
        <Minus aria-hidden="true" size="1em" />
      </Box>
      {onReset ? (
        <Box
          aria-label="Reset view"
          component="button"
          onClick={onReset}
          sx={buttonSx}
          type="button"
        >
          <Shrink aria-hidden="true" size="0.8em" />
        </Box>
      ) : null}
    </Box>
  );
}
