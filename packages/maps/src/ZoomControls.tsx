import { GlassContainer } from '@dg/ui/core/GlassContainer';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Minus, Plus } from 'lucide-react';

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
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

const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
};

/**
 * Glass morphism zoom controls overlay, positioned in the top-left corner.
 */
export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
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
