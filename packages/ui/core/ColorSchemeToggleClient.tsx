'use client';

import { Box } from '@mui/material';
import { ChevronUp, Moon, Sun, SunMoon } from 'lucide-react';
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import { createTransition, TIMING_MEDIUM, TIMING_SLOW } from '../helpers/timing';
import type { SxObject } from '../theme';
import { type ColorSchemePreference, parseColorSchemePreference } from '../theme/colorScheme';
import { useColorScheme } from '../theme/useColorScheme';
import {
  DISCLOSURE_ICON_SIZE,
  DISCLOSURE_PANEL_PADDING,
  DISCLOSURE_PANEL_WIDTH,
  DISCLOSURE_ROW_GAP,
  DISCLOSURE_ROW_HEIGHT,
  GlassDisclosurePanel,
  GlassDisclosureRow,
} from './GlassDisclosurePanel';
import { MouseAwareGlassContainer } from './MouseAwareGlassContainer';

/**
 * Row geometry in px. Collapsed, the standalone control is one padded row — a
 * glass circle. Expanded, it keeps that row as the disclosure toggle and grows
 * down and to the left to fit one row per scheme.
 */
const COLLAPSED_SIZE = DISCLOSURE_ROW_HEIGHT + DISCLOSURE_PANEL_PADDING * 2;

interface SchemeOption {
  icon: ReactNode;
  label: string;
  value: ColorSchemePreference;
}

const OPTIONS = [
  { icon: <Sun size={DISCLOSURE_ICON_SIZE} />, label: 'Light', value: 'light' },
  { icon: <Moon size={DISCLOSURE_ICON_SIZE} />, label: 'Dark', value: 'dark' },
  { icon: <SunMoon size={DISCLOSURE_ICON_SIZE} />, label: 'System', value: 'system' },
] as const satisfies ReadonlyArray<SchemeOption>;

const EXPANDED_HEIGHT =
  DISCLOSURE_PANEL_PADDING * 2 +
  DISCLOSURE_ROW_HEIGHT * (OPTIONS.length + 1) +
  DISCLOSURE_ROW_GAP * OPTIONS.length;

/** Arrow keys move through the group in either axis, matching native radios. */
const ARROW_STEPS: Record<string, number | undefined> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

/** Reserves the collapsed footprint so expanding never reflows the header. */
const anchorSx: SxObject = {
  display: 'block',
  height: COLLAPSED_SIZE,
  position: 'relative',
  width: COLLAPSED_SIZE,
};

const embeddedAnchorSx: SxObject = {
  height: DISCLOSURE_ROW_HEIGHT,
  position: 'relative',
  width: DISCLOSURE_ROW_HEIGHT,
};

/**
 * Standalone glass surface. Absolutely positioned out of the header's flow so
 * the expanded panel hangs below the sticky bar instead of stretching it, and
 * anchored to the right edge so it grows inward, away from the viewport edge.
 */
function createPanelSx(isOpen: boolean): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    height: isOpen ? EXPANDED_HEIGHT : COLLAPSED_SIZE,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    width: isOpen ? DISCLOSURE_PANEL_WIDTH : COLLAPSED_SIZE,
    zIndex: 1,
    ...createBouncyTransition(
      ['background-color', 'border-color', 'box-shadow', 'height', 'width'],
      TIMING_SLOW,
    ),
  };
}

const triggerSx: SxObject = {
  '& svg': {
    ...createBouncyTransition('scale'),
    display: 'block',
  },
  '&:hover': {
    color: 'var(--mui-palette-primary-light)',
  },
  '&:hover svg': {
    scale: 1.2,
  },
  alignItems: 'center',
  appearance: 'none',
  background: 'none',
  border: 'none',
  borderRadius: '999px',
  color: 'var(--mui-palette-primary-main)',
  cursor: 'pointer',
  display: 'flex',
  height: DISCLOSURE_ROW_HEIGHT,
  justifyContent: 'center',
  left: DISCLOSURE_PANEL_PADDING,
  padding: 0,
  position: 'absolute',
  right: DISCLOSURE_PANEL_PADDING,
  top: DISCLOSURE_PANEL_PADDING,
};

const embeddedTriggerSx: SxObject = {
  ...triggerSx,
  left: 0,
  right: 0,
  top: 0,
};

/**
 * Collapsed, the standalone list is invisible rather than unmounted so both
 * directions animate. `visibility` also takes it out of the accessibility tree
 * and out of the tab order, and `inert` keeps pointer and focus events off it.
 */
function createStandaloneListSx(isOpen: boolean): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    display: 'grid',
    left: DISCLOSURE_PANEL_PADDING,
    opacity: isOpen ? 1 : 0,
    position: 'absolute',
    right: DISCLOSURE_PANEL_PADDING,
    rowGap: `${DISCLOSURE_ROW_GAP}px`,
    top: DISCLOSURE_PANEL_PADDING + DISCLOSURE_ROW_HEIGHT + DISCLOSURE_ROW_GAP,
    transform: isOpen ? 'none' : `translateY(-${DISCLOSURE_ROW_HEIGHT / 4}px)`,
    transition: `${createTransition(['opacity', 'transform'], TIMING_MEDIUM)}, visibility 0s linear ${isOpen ? 0 : TIMING_MEDIUM}ms`,
    visibility: isOpen ? 'visible' : 'hidden',
  };
}

const embeddedListSx: SxObject = {
  display: 'grid',
  position: 'relative',
  rowGap: `${DISCLOSURE_ROW_GAP}px`,
};

/** Sliding highlight behind the selected row, echoing the albums sorter thumb. */
function createThumbSx(selectedIndex: number): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    backgroundColor: 'var(--mui-palette-action-selected)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
    borderRadius: '999px',
    height: DISCLOSURE_ROW_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    transform: `translateY(${selectedIndex * (DISCLOSURE_ROW_HEIGHT + DISCLOSURE_ROW_GAP)}px)`,
    transition: createTransition(['background-color', 'transform'], TIMING_MEDIUM),
    zIndex: 0,
  };
}

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
const inputSx: SxObject = {
  appearance: 'none',
  cursor: 'pointer',
  inset: 0,
  margin: 0,
  opacity: 0,
  position: 'absolute',
};

/**
 * Color scheme picker: a glass circle showing the active scheme that expands
 * into a vertical radio group of light, dark, and system.
 *
 * Click or tap the circle to open; picking a scheme, clicking away, tabbing
 * out, or pressing Escape closes it again. Hover deliberately does not open it,
 * since the rows would land under the cursor and invite an accidental change.
 */
type ColorSchemeToggleClientProps = {
  /** Places the trigger inside a shared parent surface and hangs its own panel below. */
  embedded?: boolean;
  /** Optional controlled state for coordinating adjacent header disclosures. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ColorSchemeToggleClient({
  embedded = false,
  isOpen: controlledIsOpen,
  onOpenChange,
}: ColorSchemeToggleClientProps = {}) {
  const { preference, setPreference } = useColorScheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  // Unique radio name so a second picker on the page can't join this group
  const radioGroupName = useId();
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const setOpen = (nextIsOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextIsOpen);
    }
    onOpenChange?.(nextIsOpen);
  };

  const matchedIndex = OPTIONS.findIndex((option) => option.value === preference);
  const selectedIndex = matchedIndex === -1 ? 0 : matchedIndex;
  const selectedOption = OPTIONS[selectedIndex] ?? OPTIONS[0];

  // Focus lands on the selected row when the list opens, wherever it opened from
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    listRef.current?.querySelector<HTMLInputElement>('input:checked')?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        if (controlledIsOpen === undefined) {
          setInternalIsOpen(false);
        }
        onOpenChange?.(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
    };
  }, [controlledIsOpen, isOpen, onOpenChange]);

  const collapse = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isOpen && event.key === 'Escape') {
      event.preventDefault();
      collapse();
    }
  };

  /**
   * Arrows and Home/End change the scheme in place so the page previews it
   * without the list snapping shut; Enter commits and closes.
   */
  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      collapse();
      return;
    }
    const step = ARROW_STEPS[event.key];
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? OPTIONS.length - 1
          : step === undefined
            ? -1
            : (selectedIndex + step + OPTIONS.length) % OPTIONS.length;
    const nextOption = nextIndex === -1 ? undefined : OPTIONS[nextIndex];
    if (!nextOption) {
      return;
    }
    event.preventDefault();
    setPreference(nextOption.value);
    listRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[nextIndex]?.focus();
  };

  const handleFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (isOpen && !event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  };

  const trigger = (
    <Box
      aria-controls={listId}
      aria-expanded={isOpen}
      aria-label={`Color scheme: ${selectedOption.label.toLowerCase()}`}
      component="button"
      onClick={() => (isOpen ? collapse() : setOpen(true))}
      ref={triggerRef}
      sx={embedded ? embeddedTriggerSx : triggerSx}
      type="button"
    >
      {isOpen ? <ChevronUp size={DISCLOSURE_ICON_SIZE} /> : selectedOption.icon}
    </Box>
  );

  const options = (
    <Box
      aria-label="Choose color scheme"
      id={listId}
      inert={!isOpen}
      onKeyDown={handleListKeyDown}
      ref={listRef}
      role="radiogroup"
      sx={embedded ? embeddedListSx : createStandaloneListSx(isOpen)}
    >
      <Box sx={createThumbSx(selectedIndex)} />
      {OPTIONS.map((option) => (
        <GlassDisclosureRow
          component="label"
          icon={option.icon}
          key={option.value}
          label={option.label}
          sx={optionRowSx}
        >
          <Box
            checked={option.value === preference}
            component="input"
            name={radioGroupName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPreference(parseColorSchemePreference(event.target.value));
              collapse();
            }}
            sx={inputSx}
            type="radio"
            value={option.value}
          />
        </GlassDisclosureRow>
      ))}
    </Box>
  );

  const rootProps = {
    onBlur: handleFocusOut,
    onKeyDown: handleRootKeyDown,
    ref: rootRef,
  };

  if (embedded) {
    return (
      <Box {...rootProps} sx={embeddedAnchorSx}>
        {trigger}
        <GlassDisclosurePanel isOpen={isOpen} label="Choose color scheme">
          {options}
        </GlassDisclosurePanel>
      </Box>
    );
  }

  return (
    <Box {...rootProps} sx={anchorSx}>
      <MouseAwareGlassContainer gravity={{ maxTilt: 1.5, radius: 180 }} sx={createPanelSx(isOpen)}>
        {trigger}
        {options}
      </MouseAwareGlassContainer>
    </Box>
  );
}
