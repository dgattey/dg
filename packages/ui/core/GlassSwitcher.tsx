'use client';

import { Box, IconButton, Radio, RadioGroup, Typography } from '@mui/material';
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import { createTransition, TIMING_MEDIUM } from '../helpers/timing';
import type { SxElement, SxObject } from '../theme';
import { GlassContainer } from './GlassContainer';
import {
  DISCLOSURE_ROW_GAP,
  disclosureListSx,
  GlassDisclosurePanel,
  GlassDisclosureRow,
  GlassDisclosureThumb,
} from './GlassDisclosurePanel';
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

const optionLabelSx: SxObject = {
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};

/** Size to match adjacent header glass container (Logo ~52px + container py 0.75 each side) */
const MOBILE_CONTAINER_SIZE = 64;

/**
 * Show only on mobile (xs), hide on sm+. Reserves the collapsed circle so the
 * panel hangs out of flow and opening it never reflows the sticky bar it sits in.
 */
const mobileOnlySx: SxObject = {
  display: { sm: 'none', xs: 'block' },
  height: MOBILE_CONTAINER_SIZE,
  position: 'relative',
  width: MOBILE_CONTAINER_SIZE,
};

/**
 * The glass circle sits *behind* the trigger as a sibling rather than wrapping
 * it, for the same reason the header capsule does: `backdrop-filter` would make
 * it the backdrop root for the panel hanging below it, which has nothing behind
 * it to sample and so paints transparent.
 */
const mobileGlassSx: SxObject = {
  borderRadius: '50%',
  inset: 0,
  position: 'absolute',
};

/** Fills the reserved circle, so the whole glass disc is the tap target. */
const mobileTriggerSx: SxObject = {
  '& svg': {
    ...createBouncyTransition('scale'),
    display: 'block',
    height: spacingPx(SPACING.iconSize),
    width: spacingPx(SPACING.iconSize),
  },
  '&:hover svg': {
    scale: 1.2,
  },
  color: 'var(--mui-palette-primary-main)',
  height: '100%',
  inset: 0,
  position: 'absolute',
  width: '100%',
};

/** Hangs the panel clear of the 64px disc rather than the 48px header row. */
const mobilePanelSx: SxObject = {
  top: MOBILE_CONTAINER_SIZE + DISCLOSURE_ROW_GAP,
};

const optionRowSx: SxObject = {
  '&:has(input:focus-visible)': {
    outline: '-webkit-focus-ring-color auto 1px',
  },
  cursor: 'pointer',
};

/**
 * Stretched over its row so the whole row is the tap target, and kept at zero
 * opacity rather than `display: none` so it stays focusable and announced.
 */
const mobileInputSx: SxObject = {
  appearance: 'none',
  cursor: 'pointer',
  inset: 0,
  margin: 0,
  opacity: 0,
  position: 'absolute',
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

/**
 * Desktop: individual clickable option with hidden radio input. Icon options
 * get a tooltip with the label; text options show the label directly.
 */
function SwitcherOption({ option, isSelected, onChange }: SwitcherOptionProps) {
  const element = (
    <Box component="label" sx={optionStyles}>
      <Radio
        checked={isSelected}
        onChange={(event) => onChange(event.target.value)}
        sx={hiddenRadioSx}
        value={option.value}
      />
      {option.icon ?? (
        <Typography component="span" sx={optionLabelSx} variant="caption">
          {option.label}
        </Typography>
      )}
    </Box>
  );

  if (!option.label || !option.icon) {
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
  /**
   * Icon for the mobile menu trigger. Required for text-only options, which
   * have no per-option icon to show; falls back to the selected option's icon.
   */
  mobileIcon?: ReactNode;
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
  mobileIcon,
}: GlassSwitcherProps) {
  const menuId = useId();
  // Unique radio name so multiple switchers on a page don't share a native group
  const radioGroupName = useId();
  // The mobile panel renders alongside the desktop row, so it needs its own group
  const mobileRadioGroupName = useId();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileRootRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value),
  );
  const selectedOption = options[selectedIndex];
  const optionCount = options.length;

  // Focus lands on the selected row when the panel opens, wherever it opened from
  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }
    mobileListRef.current?.querySelector<HTMLInputElement>('input:checked')?.focus();
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!mobileRootRef.current?.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
    };
  }, [isMobileOpen]);

  const collapseMobile = () => {
    setIsMobileOpen(false);
    mobileTriggerRef.current?.focus();
  };

  const handleMobileKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isMobileOpen && event.key === 'Escape') {
      event.preventDefault();
      collapseMobile();
    }
  };

  const handleMobileFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (isMobileOpen && !event.currentTarget.contains(event.relatedTarget)) {
      setIsMobileOpen(false);
    }
  };

  const handleMobileSelect = (newValue: string) => {
    onChange(newValue);
    collapseMobile();
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
      {/* Mobile: glass disc trigger + the shared disclosure panel */}
      <Box
        data-role="glass-switcher-mobile"
        onBlur={handleMobileFocusOut}
        onKeyDown={handleMobileKeyDown}
        ref={mobileRootRef}
        sx={mobileSx}
      >
        <GlassContainer aria-hidden={true} data-switcher-glass={true} sx={mobileGlassSx} />
        {/*
         * No tooltip here, unlike the desktop options: this trigger only shows at
         * xs, where there is no hover to reveal one, and `aria-label` already
         * names it.
         */}
        <IconButton
          aria-controls={isMobileOpen ? menuId : undefined}
          aria-expanded={isMobileOpen}
          aria-haspopup="true"
          aria-label={ariaLabel}
          onClick={() => (isMobileOpen ? collapseMobile() : setIsMobileOpen(true))}
          ref={mobileTriggerRef}
          sx={mobileTriggerSx}
        >
          {mobileIcon ?? selectedOption?.icon}
        </IconButton>
        <GlassDisclosurePanel
          align="start"
          id={menuId}
          isOpen={isMobileOpen}
          label={ariaLabel ?? ''}
          role="radiogroup"
          sx={mobilePanelSx}
        >
          {/*
           * The rows need their own positioned wrapper: the thumb is absolute, and
           * against the panel it would resolve to the padding box and overhang the
           * rows by the panel's padding on each side.
           */}
          <Box ref={mobileListRef} sx={disclosureListSx}>
            <GlassDisclosureThumb selectedIndex={selectedIndex} />
            {options.map((option) => (
              <GlassDisclosureRow
                component="label"
                icon={option.icon}
                key={option.value}
                label={option.label}
                sx={optionRowSx}
              >
                <Box
                  checked={option.value === value}
                  component="input"
                  name={mobileRadioGroupName}
                  onChange={() => handleMobileSelect(option.value)}
                  sx={mobileInputSx}
                  type="radio"
                  value={option.value}
                />
              </GlassDisclosureRow>
            ))}
          </Box>
        </GlassDisclosurePanel>
      </Box>

      {/* Desktop: Horizontal RadioGroup with thumb indicator */}
      <MouseAwareGlassContainer data-role="glass-switcher" sx={desktopSx}>
        <RadioGroup
          aria-label={ariaLabel}
          name={radioGroupName}
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
