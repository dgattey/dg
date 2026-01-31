'use client';

import { Box, Radio, RadioGroup } from '@mui/material';
import type { ReactNode } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import type { SxElement, SxObject } from '../theme';
import { GlassContainer } from './GlassContainer';
import { Tooltip } from './Tooltip';

// ─────────────────────────────────────────────────────────────────────────────
// Layout Configuration
// ─────────────────────────────────────────────────────────────────────────────
// This component renders horizontally on sm+ screens and vertically on xs.
// A sliding "thumb" indicator shows the current selection.

/** Spacing constants (in theme spacing units) */
const SPACING = {
  /** Outer padding (horizontal layout) */
  containerPaddingSm: 0.85,
  /** Outer padding (vertical layout) */
  containerPaddingXs: 0.25,
  /** Inner padding of radio group */
  groupPadding: 0.25,
  /** Icon size inside each option */
  iconSize: 2.25,
  /** Minimum option height */
  optionMinHeight: 4.25,
  /** Minimum option width */
  optionMinWidth: 7,
  /** Vertical padding inside each option */
  optionPaddingBlock: 0.5,
  /** Horizontal padding inside each option */
  optionPaddingInline: 1.25,
  /** Gap between options and thumb edge */
  thumbGap: 0.25,
  /** Height of thumb in horizontal layout */
  thumbHeight: 5,
} as const;

// MUI default spacing is 8px; keep sx objects theme-free for SSR.
const BASE_SPACING_PX = 8;
const spacingPx = (value: number) => `${value * BASE_SPACING_PX}px`;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const glassSwitcherBaseSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  maxWidth: '100%',
  padding: {
    sm: spacingPx(SPACING.containerPaddingSm),
    xs: spacingPx(SPACING.containerPaddingXs),
  },
  position: 'relative',
  width: { sm: 'fit-content', xs: '100%' },
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

/**
 * Creates CSS variables and thumb positioning styles.
 * Variables are defined here so the thumb can calculate its position.
 */
function createThumbStyles(optionCount: number, selectedIndex: number): SxObject {
  // Pre-calculate some values for clarity
  const gap = spacingPx(SPACING.thumbGap);
  const optionHeight = spacingPx(SPACING.optionMinHeight);
  const paddingBlock = spacingPx(SPACING.optionPaddingBlock);

  // Total row height in vertical layout = option height + top/bottom padding
  const rowHeight = `calc(${optionHeight} + (${paddingBlock} * 2))`;

  return {
    backgroundColor: 'var(--mui-palette-action-selected)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',

    // Horizontal layout (sm+): pill-shaped thumb slides left/right
    // Vertical layout (xs): circular thumb slides up/down
    borderRadius: { sm: '999px', xs: '50%' },
    content: '""',
    height: { sm: spacingPx(SPACING.thumbHeight), xs: optionHeight },

    // Position the thumb to center on the selected option
    left: { sm: 0, xs: '50%' },
    position: 'absolute',
    top: {
      sm: '50%',
      xs: `calc((${selectedIndex} * (${rowHeight} + ${gap})) + (${rowHeight} / 2))`,
    },
    transform: {
      sm: `translate(calc(${selectedIndex} * (100% + ${gap})), -50%)`,
      xs: 'translate(-50%, -50%)',
    },
    transition: 'background-color 200ms ease, transform 200ms ease',
    width: {
      sm: `calc((100% - (${gap} * ${optionCount - 1})) / ${optionCount})`,
      xs: optionHeight,
    },
    zIndex: 0,
  };
}

function createGridStyles(optionCount: number): SxObject {
  const gap = spacingPx(SPACING.thumbGap);
  const optionHeight = spacingPx(SPACING.optionMinHeight);
  const paddingBlock = spacingPx(SPACING.optionPaddingBlock);
  const rowHeight = `calc(${optionHeight} + (${paddingBlock} * 2))`;

  return {
    alignItems: 'stretch',
    columnGap: { sm: gap, xs: 0 },
    display: 'grid',

    // Horizontal: options flow in columns
    // Vertical: options stack in rows
    gridAutoFlow: { sm: 'column', xs: 'row' },
    gridTemplateColumns: { sm: `repeat(${optionCount}, minmax(0, 1fr))`, xs: 'none' },
    gridTemplateRows: { sm: 'none', xs: `repeat(${optionCount}, ${rowHeight})` },
    height: { sm: '100%', xs: 'auto' },
    justifyItems: 'stretch',
    padding: spacingPx(SPACING.groupPadding),
    position: 'relative',
    rowGap: { sm: 0, xs: gap },
    width: { sm: 'auto', xs: '100%' },
    zIndex: 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

interface SwitcherOptionProps {
  option: GlassSwitcherOption;
  isSelected: boolean;
  onChange: (value: string) => void;
}

/** Individual clickable option with icon and hidden radio input */
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
  /** The icon to display for this option */
  icon?: ReactNode;
  /** Display label for the option (shown in tooltip) */
  label: string;
  /** Unique value identifier for the option */
  value: string;
}

export interface GlassSwitcherProps {
  /** Currently selected option value */
  value: string;
  /** Callback when the selection changes */
  onChange: (value: string) => void;
  /** Array of options to display */
  options: Array<GlassSwitcherOption>;
  /** Additional styling to apply to the container (object only, not array) */
  sx?: SxElement;
  /** Accessible label for the radio group */
  'aria-label'?: string;
}

/**
 * A switcher component with glass morphism styling and a sliding thumb indicator.
 * Renders horizontally on larger screens and vertically on mobile.
 */
export function GlassSwitcher({
  value,
  onChange,
  options,
  sx,
  'aria-label': ariaLabel,
}: GlassSwitcherProps) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value),
  );
  const optionCount = options.length;

  // Merge base and custom styles
  const mergedSx: SxElement = sx ? { ...glassSwitcherBaseSx, ...sx } : glassSwitcherBaseSx;
  const radioGroupSx: SxObject = {
    '&::before': createThumbStyles(optionCount, selectedIndex),
    ...createGridStyles(optionCount),
  };

  return (
    <GlassContainer data-role="glass-switcher" sx={mergedSx}>
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
    </GlassContainer>
  );
}
