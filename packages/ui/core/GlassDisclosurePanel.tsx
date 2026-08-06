'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import { createTransition, TIMING_SLOW } from '../helpers/timing';
import type { SxObject } from '../theme';
import { MouseAwareGlassContainer } from './MouseAwareGlassContainer';

/** Shared geometry for header disclosures that hang under a trigger. */
export const DISCLOSURE_ICON_SIZE = 22;
export const DISCLOSURE_ROW_HEIGHT = 48;
export const DISCLOSURE_ROW_GAP = 4;
export const DISCLOSURE_PANEL_PADDING = 8;
export const DISCLOSURE_PANEL_WIDTH = 208;

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

const panelBaseSx: SxObject = {
  boxSizing: 'border-box',
  display: 'grid',
  padding: `${DISCLOSURE_PANEL_PADDING}px`,
  position: 'absolute',
  right: 0,
  rowGap: `${DISCLOSURE_ROW_GAP}px`,
  top: DISCLOSURE_ROW_HEIGHT + DISCLOSURE_ROW_GAP,
  width: DISCLOSURE_PANEL_WIDTH,
  zIndex: 2,
};

function createPanelMotionSx(isOpen: boolean): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    // Only the open/close offset — MouseAwareGlassContainer prefixes gravity.
    transform: isOpen ? undefined : `translateY(-${DISCLOSURE_ROW_HEIGHT / 4}px)`,
    visibility: isOpen ? 'visible' : 'hidden',
    ...createBouncyTransition(['opacity', 'transform'], TIMING_SLOW),
    transition: `${createTransition(['opacity', 'transform'], TIMING_SLOW)}, visibility 0s linear ${
      isOpen ? 0 : TIMING_SLOW
    }ms`,
  };
}

const rowBaseSx: SxObject = {
  '& svg': {
    ...createBouncyTransition('scale'),
    display: 'block',
    height: DISCLOSURE_ICON_SIZE,
    width: DISCLOSURE_ICON_SIZE,
  },
  '&:hover': {
    color: 'var(--mui-palette-primary-light)',
  },
  '&:hover svg': {
    scale: 1.2,
  },
  alignItems: 'center',
  borderRadius: '999px',
  boxSizing: 'border-box',
  color: 'var(--mui-palette-primary-main)',
  display: 'grid',
  gridTemplateColumns: `${DISCLOSURE_ROW_HEIGHT}px 1fr`,
  height: DISCLOSURE_ROW_HEIGHT,
  minWidth: 0,
  position: 'relative',
  textDecoration: 'none',
  width: '100%',
  zIndex: 1,
};

const iconCellSx: SxObject = {
  display: 'grid',
  placeItems: 'center',
};

const labelSx: SxObject = {
  lineHeight: 1.2,
  minWidth: 0,
  overflow: 'hidden',
  paddingInlineEnd: 1.5,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

type GlassDisclosurePanelProps = {
  children: ReactNode;
  isOpen: boolean;
  /** Accessible name for the disclosure surface. */
  label: string;
  id?: string;
  role?: string;
  sx?: SxObject;
};

/**
 * Shared glass disclosure panel for header menus. Uses the same
 * MouseAwareGlassContainer treatment as the logo capsule; open/close motion
 * composes with gravity instead of replacing it.
 */
export function GlassDisclosurePanel({
  children,
  id,
  isOpen,
  label,
  role,
  sx,
}: GlassDisclosurePanelProps) {
  return (
    <MouseAwareGlassContainer
      aria-hidden={!isOpen}
      aria-label={label}
      gravity={{ maxTilt: 1.5, radius: 180 }}
      id={id}
      inert={!isOpen}
      role={role}
      sx={{ ...panelBaseSx, ...createPanelMotionSx(isOpen), ...sx }}
    >
      {children}
    </MouseAwareGlassContainer>
  );
}

type GlassDisclosureRowProps = {
  icon: ReactNode;
  label: string;
  children?: ReactNode;
  component?: React.ElementType;
  onClick?: () => void;
  sx?: SxObject;
};

/**
 * Shared disclosure row chrome: icon cell + caption label, pill hover treatment.
 * Wrap with a link, label+radio, or button as the interactive element.
 */
export function GlassDisclosureRow({
  children,
  component = 'div',
  icon,
  label,
  onClick,
  sx,
}: GlassDisclosureRowProps) {
  return (
    <Box component={component} onClick={onClick} sx={{ ...rowBaseSx, ...sx }}>
      {children}
      <Box aria-hidden component="span" sx={iconCellSx}>
        {icon}
      </Box>
      <Typography component="span" sx={labelSx} variant="caption">
        {label}
      </Typography>
    </Box>
  );
}
