import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { GlassContainer } from '@dg/ui/core/GlassContainer';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Minus, Plus } from 'lucide-react';

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  surface?: SiteSurface;
};

const containerSx: SxObject = {
  borderRadius: '24px',
  display: 'flex',
  left: 26,
  overflow: 'hidden',
  position: 'absolute',
  top: 26,
  zIndex: 1,
};

const dividerSx: SxObject = {
  backgroundColor: 'divider',
  width: '1px',
};

const buttonSx: SxObject = {
  ':hover': {
    backgroundColor: 'action.hover',
  },
  alignItems: 'center',
  background: 'none',
  border: 'none',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'flex',
  fontSize: '1rem',
  justifyContent: 'center',
  lineHeight: 1,
  padding: '0.4rem 0.5rem',
  transition: 'background-color 0.2s',
};

const collageContainerSx: SxObject = {
  display: 'grid',
  gap: '5px',
  position: 'absolute',
  right: 12,
  top: 12,
  zIndex: 2,
};

const collageButtonSx: SxObject = {
  ':hover': {
    backgroundColor: 'color-mix(in srgb, var(--cream) 86%, var(--ochre))',
  },
  alignItems: 'center',
  backgroundColor: 'var(--cream)',
  border: 0,
  clipPath: 'var(--quad-b)',
  color: 'var(--ink-on-cream)',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 17,
  fontWeight: 800,
  height: 28,
  justifyContent: 'center',
  padding: 0,
  width: 28,
};

const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export function ZoomControls({ onZoomIn, onZoomOut, surface = 'classic' }: ZoomControlsProps) {
  if (surface === 'collage') {
    return (
      <Box onMouseDown={stopPropagation} onMouseUp={stopPropagation} sx={collageContainerSx}>
        <Box
          aria-label="Zoom in"
          component="button"
          onClick={onZoomIn}
          sx={collageButtonSx}
          type="button"
        >
          <Plus aria-hidden="true" size="1em" />
        </Box>
        <Box
          aria-label="Zoom out"
          component="button"
          onClick={onZoomOut}
          sx={collageButtonSx}
          type="button"
        >
          <Minus aria-hidden="true" size="1em" />
        </Box>
      </Box>
    );
  }

  return (
    <GlassContainer onMouseDown={stopPropagation} onMouseUp={stopPropagation} sx={containerSx}>
      <Box aria-label="Zoom in" component="button" onClick={onZoomIn} sx={buttonSx} type="button">
        <Plus size="1em" />
      </Box>
      <Box sx={dividerSx} />
      <Box aria-label="Zoom out" component="button" onClick={onZoomOut} sx={buttonSx} type="button">
        <Minus size="1em" />
      </Box>
    </GlassContainer>
  );
}
