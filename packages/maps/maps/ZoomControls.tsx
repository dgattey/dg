import type { SxProps } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Minus, Plus } from 'lucide-react';

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

const containerSx: SxProps = (theme) => ({
  borderRadius: theme.spacing(6),
  boxShadow: theme.vars.extraShadows.map.control,
  display: 'flex',
  left: theme.spacing(3.25),
  overflow: 'hidden',
  position: 'absolute',
  top: theme.spacing(3.25),
  zIndex: 1,
});

const buttonSx: SxProps = (theme) => ({
  ':hover': {
    backgroundColor: theme.vars.palette.secondary.main,
    color: theme.vars.palette.secondary.contrastText,
  },
  alignItems: 'center',
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
  cursor: 'pointer',
  display: 'flex',
  fontSize: '1rem',
  justifyContent: 'center',
  lineHeight: 1,
  padding: '0.5rem',
  transition: theme.transitions.create(['background-color', 'color']),
});

/**
 * Zoom controls overlay for the map.
 * Positioned in the top-left corner with theme-aware styling.
 */
export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <Box sx={containerSx}>
      <Box aria-label="Zoom in" component="button" onClick={onZoomIn} sx={buttonSx} type="button">
        <Plus size="1em" />
      </Box>
      <Box aria-label="Zoom out" component="button" onClick={onZoomOut} sx={buttonSx} type="button">
        <Minus size="1em" />
      </Box>
    </Box>
  );
}
