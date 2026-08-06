'use client';

import { Box, Typography } from '@mui/material';
import { ChevronUp, Moon, Sun, SunMoon } from 'lucide-react';
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import { createTransition, TIMING_MEDIUM, TIMING_SLOW } from '../helpers/timing';
import type { SxObject } from '../theme';
import { type ColorSchemePreference, parseColorSchemePreference } from '../theme/colorScheme';
import { useColorScheme } from '../theme/useColorScheme';
import { MouseAwareGlassContainer } from './MouseAwareGlassContainer';

const ICON_SIZE = 22;

/**
 * Row geometry in px. Collapsed, the control is one padded row — a glass
 * circle. Expanded, it keeps that row as the disclosure toggle and grows down
 * and to the left to fit one row per scheme.
 */
const ROW_HEIGHT = 48;
const ROW_GAP = 4;
const PANEL_PADDING = 8;
const COLLAPSED_SIZE = ROW_HEIGHT + PANEL_PADDING * 2;
const EXPANDED_WIDTH = 176;

interface SchemeOption {
  icon: ReactNode;
  label: string;
  value: ColorSchemePreference;
}

const OPTIONS = [
  { icon: <Sun size={ICON_SIZE} />, label: 'Light', value: 'light' },
  { icon: <Moon size={ICON_SIZE} />, label: 'Dark', value: 'dark' },
  { icon: <SunMoon size={ICON_SIZE} />, label: 'System', value: 'system' },
] as const satisfies ReadonlyArray<SchemeOption>;

const EXPANDED_HEIGHT =
  PANEL_PADDING * 2 + ROW_HEIGHT * (OPTIONS.length + 1) + ROW_GAP * OPTIONS.length;
const EMBEDDED_EXPANDED_HEIGHT =
  PANEL_PADDING * 2 + ROW_HEIGHT * OPTIONS.length + ROW_GAP * (OPTIONS.length - 1);

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
  height: ROW_HEIGHT,
  position: 'relative',
  width: ROW_HEIGHT,
};

/**
 * The glass surface itself. Absolutely positioned out of the header's flow so
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
    width: isOpen ? EXPANDED_WIDTH : COLLAPSED_SIZE,
    zIndex: 1,
    ...createBouncyTransition(
      ['background-color', 'border-color', 'box-shadow', 'height', 'width'],
      TIMING_SLOW,
    ),
  };
}

function createEmbeddedPanelSx(isOpen: boolean): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    height: isOpen ? EMBEDDED_EXPANDED_HEIGHT : 0,
    opacity: isOpen ? 1 : 0,
    overflow: 'hidden',
    pointerEvents: isOpen ? 'auto' : 'none',
    position: 'absolute',
    right: 0,
    top: ROW_HEIGHT + ROW_GAP,
    transform: isOpen ? 'none' : `translateY(-${ROW_HEIGHT / 4}px)`,
    width: EXPANDED_WIDTH,
    zIndex: 2,
    ...createBouncyTransition(['height', 'opacity', 'transform'], TIMING_SLOW),
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
  height: ROW_HEIGHT,
  justifyContent: 'center',
  left: PANEL_PADDING,
  padding: 0,
  position: 'absolute',
  right: PANEL_PADDING,
  top: PANEL_PADDING,
};

const embeddedTriggerSx: SxObject = {
  ...triggerSx,
  left: 0,
  right: 0,
  top: 0,
};

/**
 * Collapsed, the list is invisible rather than unmounted so both directions
 * animate. `visibility` also takes it out of the accessibility tree and out of
 * the tab order, and `inert` keeps pointer and focus events off it.
 */
function createListSx(isOpen: boolean): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    display: 'grid',
    left: PANEL_PADDING,
    opacity: isOpen ? 1 : 0,
    position: 'absolute',
    right: PANEL_PADDING,
    rowGap: `${ROW_GAP}px`,
    top: PANEL_PADDING + ROW_HEIGHT + ROW_GAP,
    transform: isOpen ? 'none' : `translateY(-${ROW_HEIGHT / 4}px)`,
    transition: `${createTransition(['opacity', 'transform'], TIMING_MEDIUM)}, visibility 0s linear ${isOpen ? 0 : TIMING_MEDIUM}ms`,
    visibility: isOpen ? 'visible' : 'hidden',
  };
}

function createEmbeddedListSx(isOpen: boolean): SxObject {
  return {
    ...createListSx(isOpen),
    top: PANEL_PADDING,
  };
}

/** Sliding highlight behind the selected row, echoing the albums sorter thumb. */
function createThumbSx(selectedIndex: number): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    backgroundColor: 'var(--mui-palette-action-selected)',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
    borderRadius: '999px',
    height: ROW_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    transform: `translateY(${selectedIndex * (ROW_HEIGHT + ROW_GAP)}px)`,
    transition: createTransition(['background-color', 'transform'], TIMING_MEDIUM),
    zIndex: 0,
  };
}

const optionSx: SxObject = {
  '& svg': {
    ...createBouncyTransition('scale'),
    display: 'block',
  },
  '&:has(input:focus-visible)': {
    outline: '-webkit-focus-ring-color auto 1px',
  },
  '&:hover': {
    color: 'var(--mui-palette-primary-light)',
  },
  '&:hover svg': {
    scale: 1.2,
  },
  alignItems: 'center',
  borderRadius: '999px',
  color: 'var(--mui-palette-primary-main)',
  cursor: 'pointer',
  display: 'grid',
  gridTemplateColumns: `${ROW_HEIGHT}px 1fr`,
  height: ROW_HEIGHT,
  position: 'relative',
  zIndex: 1,
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

const iconCellSx: SxObject = {
  display: 'grid',
  placeItems: 'center',
};

const optionLabelSx: SxObject = {
  lineHeight: 1.2,
  paddingInlineEnd: 1.5,
  whiteSpace: 'nowrap',
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
      {isOpen ? <ChevronUp size={ICON_SIZE} /> : selectedOption.icon}
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
      sx={embedded ? createEmbeddedListSx(isOpen) : createListSx(isOpen)}
    >
      <Box sx={createThumbSx(selectedIndex)} />
      {OPTIONS.map((option) => (
        <Box component="label" key={option.value} sx={optionSx}>
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
          <Box sx={iconCellSx}>{option.icon}</Box>
          <Typography component="span" sx={optionLabelSx} variant="caption">
            {option.label}
          </Typography>
        </Box>
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
        <MouseAwareGlassContainer
          gravity={{ maxTilt: 1.5, radius: 180 }}
          sx={createEmbeddedPanelSx(isOpen)}
        >
          {options}
        </MouseAwareGlassContainer>
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
