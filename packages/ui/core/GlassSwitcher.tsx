'use client';

import { Box, IconButton, Menu, MenuItem, Radio, RadioGroup } from '@mui/material';
import type { MouseEvent, ReactNode } from 'react';
import { useId, useState } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import { createTransition, TIMING_MEDIUM } from '../helpers/timing';
import type { SxElement, SxObject } from '../theme';
import { GlassContainer } from './GlassContainer';
import { MouseAwareGlassContainer } from './MouseAwareGlassContainer';
import { Tooltip } from './Tooltip';

/** Spacing constants (in theme spacing units) */
export const SPACING = {
  containerPaddingSm: 0.85,
  containerPaddingXs: 0.25,
  groupPadding: 0.25,
  iconSize: 2.25,
  optionMinHeight: 4.25,
  optionMinWidth: 7,
  optionPaddingBlock: 0.5,
  optionPaddingInline: 1.25,
  thumbGap: 0.25,
  thumbHeight: 5,
} as const;

const BASE_SPACING_PX = 8;
export const spacingPx = (value: number) => `${value * BASE_SPACING_PX}px`;

/**
 * Creates thumb positioning styles for the desktop horizontal layout.
 */
export function createThumbStyles(optionCount: number, selectedIndex: number): SxObject {
  const gap = spacingPx(SPACING.thumbGap);
  const groupPadding = spacingPx(SPACING.groupPadding);

  return {
    backgroundColor: 'var(--mui-palette-action-selected)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
    borderRadius: '999px',
    content: '""',
    height: spacingPx(SPACING.thumbHeight),
    left: groupPadding,
    position: 'absolute',
    top: '50%',
    transform: `translate(calc(${selectedIndex} * (100% + ${gap})), -50%)`,
    transition: createTransition(['background-color', 'transform'], TIMING_MEDIUM),
    width: `calc((100% - 2*${groupPadding} - (${gap} * ${optionCount - 1})) / ${optionCount})`,
    zIndex: 0,
  };
}

/**
 * Creates grid layout styles for the desktop horizontal layout.
 */
export function createGridStyles(optionCount: number): SxObject {
  const gap = spacingPx(SPACING.thumbGap);

  return {
    alignItems: 'stretch',
    columnGap: gap,
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateColumns: `repeat(${optionCount}, minmax(0, 1fr))`,
    height: '100%',
    justifyItems: 'stretch',
    padding: spacingPx(SPACING.groupPadding),
    position: 'relative',
    width: 'auto',
    zIndex: 1,
  };
}

const glassSwitcherBaseSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  maxWidth: '100%',
  padding: spacingPx(SPACING.containerPaddingSm),
  position: 'relative',
  width: 'fit-content',
};

const optionStyles: SxObject = {
  '& svg': {
    ...createBouncyTransition('scale'),
    display: 'block',
    height: spacingPx(SPACING.iconSize),
    width: spacingPx(SPACING.iconSize),
  },
  '&:hover': {
    '& svg': { scale: 1.25 },
    color: 'var(--mui-palette-primary-light)',
    cursor: 'pointer',
  },
  boxSizing: 'border-box',
  color: 'var(--mui-palette-primary-main)',
  display: 'grid',
  height: '100%',
  lineHeight: 0,
  minHeight: spacingPx(SPACING.optionMinHeight),
  minWidth: spacingPx(SPACING.optionMinWidth),
  paddingBlock: spacingPx(SPACING.optionPaddingBlock),
  paddingInline: spacingPx(SPACING.optionPaddingInline),
  placeItems: 'center',
  position: 'relative',
  width: '100%',
  zIndex: 1,
};

const hiddenRadioSx: SxObject = {
  display: 'none',
};

/** Size to match adjacent header glass container (Logo ~52px + container py 0.75 each side) */
const MOBILE_CONTAINER_SIZE = 64;

/** Mobile icon button - fills container for large touch target */
const mobileButtonSx: SxObject = {
  '& svg': {
    height: spacingPx(SPACING.iconSize),
    width: spacingPx(SPACING.iconSize),
  },
  color: 'var(--mui-palette-primary-main)',
  height: '100%',
  width: '100%',
};

const menuItemSx: SxObject = {
  '& svg': {
    height: spacingPx(SPACING.iconSize),
    marginRight: 1.5,
    width: spacingPx(SPACING.iconSize),
  },
  color: 'var(--mui-palette-primary-main)',
};

/** Show only on mobile (xs), hide on sm+ - circular, same height as adjacent content */
const mobileOnlySx: SxObject = {
  alignItems: 'center',
  borderRadius: '50%',
  display: { sm: 'none', xs: 'flex' },
  height: MOBILE_CONTAINER_SIZE,
  justifyContent: 'center',
  width: MOBILE_CONTAINER_SIZE,
};

/** Show only on desktop (sm+), hide on mobile */
const desktopOnlySx: SxObject = {
  display: { sm: 'flex', xs: 'none' },
};

interface SwitcherOptionProps {
  option: GlassSwitcherOption;
  isSelected: boolean;
  onChange: (value: string) => void;
}

/** Desktop: Individual clickable option with icon and hidden radio input */
function SwitcherOption({ option, isSelected, onChange }: SwitcherOptionProps) {
  const element = (
    <Box component="label" sx={optionStyles}>
      <Radio
        checked={isSelected}
        onChange={(event) => onChange(event.target.value)}
        sx={hiddenRadioSx}
        value={option.value}
      />
      {option.icon}
    </Box>
  );

  if (!option.label) {
    return element;
  }

  return <Tooltip title={option.label}>{element}</Tooltip>;
}

export interface GlassSwitcherOption {
  icon?: ReactNode;
  label: string;
  value: string;
}

export interface GlassSwitcherProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<GlassSwitcherOption>;
  sx?: SxElement;
  'aria-label'?: string;
}

/**
 * A switcher component with glass morphism styling.
 * Desktop: Horizontal row with sliding thumb indicator.
 * Mobile: Single icon button that opens a menu to select.
 */
export function GlassSwitcher({
  value,
  onChange,
  options,
  sx,
  'aria-label': ariaLabel,
}: GlassSwitcherProps) {
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value),
  );
  const selectedOption = options[selectedIndex];
  const optionCount = options.length;

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuSelect = (newValue: string) => {
    onChange(newValue);
    handleMenuClose();
  };

  const desktopSx: SxElement = sx
    ? { ...glassSwitcherBaseSx, ...desktopOnlySx, ...sx }
    : { ...glassSwitcherBaseSx, ...desktopOnlySx };
  const mobileSx: SxElement = sx ? { ...mobileOnlySx, ...sx } : mobileOnlySx;

  const radioGroupSx: SxObject = {
    '&::before': createThumbStyles(optionCount, selectedIndex),
    ...createGridStyles(optionCount),
  };

  return (
    <>
      {/* Mobile: IconButton + Menu - uses GlassContainer (no mouse effects on touch) */}
      <GlassContainer data-role="glass-switcher" sx={mobileSx}>
        <IconButton
          aria-controls={menuAnchor ? menuId : undefined}
          aria-expanded={menuAnchor ? 'true' : undefined}
          aria-haspopup="true"
          aria-label={ariaLabel}
          onClick={handleMenuOpen}
          sx={mobileButtonSx}
        >
          {selectedOption?.icon}
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          id={menuId}
          onClose={handleMenuClose}
          open={Boolean(menuAnchor)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleMenuSelect(option.value)}
              selected={value === option.value}
              sx={menuItemSx}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </GlassContainer>

      {/* Desktop: Horizontal RadioGroup with thumb indicator */}
      <MouseAwareGlassContainer data-role="glass-switcher" sx={desktopSx}>
        <RadioGroup
          aria-label={ariaLabel}
          name="glass-switcher"
          onChange={(event) => onChange(event.target.value)}
          sx={radioGroupSx}
          value={value}
        >
          {options.map((option) => (
            <SwitcherOption
              isSelected={value === option.value}
              key={option.value}
              onChange={onChange}
              option={option}
            />
          ))}
        </RadioGroup>
      </MouseAwareGlassContainer>
    </>
  );
}
