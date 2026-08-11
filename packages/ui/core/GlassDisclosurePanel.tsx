'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import {
  createTransition,
  EASING_BOUNCY,
  TIMING_BOUNCY,
  TIMING_MEDIUM,
  TIMING_NORMAL,
} from '../helpers/timing';
import type { SxObject } from '../theme';
import { GlassContainer } from './GlassContainer';

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
  rowGap: `${DISCLOSURE_ROW_GAP}px`,
  top: DISCLOSURE_ROW_HEIGHT + DISCLOSURE_ROW_GAP,
  width: DISCLOSURE_PANEL_WIDTH,
  zIndex: 2,
};

/**
 * Which edge the panel shares with its trigger. The panel is wider than every
 * trigger that opens one, so it always grows sideways: pinned to the trigger's
 * inline-end it grows inward from page chrome on the right, and pinned to the
 * inline-start it grows inward from a control on the left. Getting this backwards
 * puts the panel off the side of the viewport rather than merely off-centre.
 */
export type DisclosureAlign = 'start' | 'end';

const alignSx: Record<DisclosureAlign, SxObject> = {
  end: { insetInlineEnd: 0 },
  start: { insetInlineStart: 0 },
};

/**
 * Marks the element whose `<details open>` state drives the panel inside it.
 *
 * A panel needs a no-script way to know it is open, and `<details>` is the only
 * disclosure the platform tracks on its own. Selecting on the host rather than
 * on the details itself lets the panel stay a *sibling* of the disclosure, out
 * of the details' own content, so its motion is ours to animate and the glass
 * nesting rules below still hold.
 */
export const DISCLOSURE_HOST_ATTRIBUTE = 'data-disclosure-host';

/** Spread onto the element that wraps a `<details>` trigger and its panel. */
export const disclosureHostProps = { [DISCLOSURE_HOST_ATTRIBUTE]: true } as const;

/**
 * One shorthand, three different jobs — the properties genuinely need different
 * curves, so composing them by hand beats a helper that spreads a single easing
 * across all of them.
 *
 * `EASING_BOUNCY` is a full spring: it overshoots to 1.337 and rings down
 * through several oscillations before settling, so it needs `TIMING_BOUNCY` to
 * read as a bounce rather than a stutter. That is the duration `ContentCard`
 * gives it, which is why the cards feel right and this panel is matched to them.
 *
 * Only `transform` springs. Opacity clamps at 1, so an overshoot there flattens
 * into a hitch instead of a bounce, and a panel that spends the whole spring
 * fading in reads as sluggish — it fades on `TIMING_NORMAL` and is fully opaque
 * while the slide is still settling.
 *
 * `visibility` is what keeps a closed panel out of the a11y tree and the tab
 * order, so its delay tracks the opacity duration rather than the longer
 * transform: any longer and the panel stays reachable after it looks gone.
 */
function createPanelMotionSx(isOpen: boolean): SxObject {
  return {
    [REDUCED_MOTION]: { transition: 'none' },
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    transform: isOpen ? 'none' : `translateY(-${DISCLOSURE_ROW_HEIGHT / 4}px)`,
    transition: [
      createTransition('transform', TIMING_BOUNCY, EASING_BOUNCY),
      createTransition('opacity', TIMING_NORMAL),
      `visibility 0s linear ${isOpen ? 0 : TIMING_NORMAL}ms`,
    ].join(', '),
    visibility: isOpen ? 'visible' : 'hidden',
  };
}

/**
 * Closed until a host `<details>` says otherwise, with no React state involved.
 *
 * `visibility` is doing the accessibility work here that `inert` cannot: a
 * script-driven panel can be marked inert as it closes, but an attribute
 * rendered on the server never changes without scripting, so a panel that
 * shipped `inert` would stay unusable for exactly the visitors this path is for.
 * A `visibility: hidden` panel is already out of the tab order and out of the
 * accessibility tree, which is what `inert` was insuring against.
 */
const detailsDrivenMotionSx: SxObject = {
  ...createPanelMotionSx(false),
  [`[${DISCLOSURE_HOST_ATTRIBUTE}]:has(> details[open]) &`]: createPanelMotionSx(true),
};

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

/** Text-only rows drop the icon cell rather than indenting past an empty one. */
const labelOnlyRowSx: SxObject = {
  gridTemplateColumns: '1fr',
  paddingInlineStart: 1.75,
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
  /**
   * Script-owned open state. Omit it to let a host `<details open>` drive the
   * panel from CSS alone, which is what keeps a disclosure working with
   * scripting off — see `DISCLOSURE_HOST_ATTRIBUTE`.
   */
  isOpen?: boolean;
  /** Accessible name for the disclosure surface. */
  label: string;
  /** Trigger edge the panel is pinned to. Defaults to the inline end. */
  align?: DisclosureAlign;
  id?: string;
  role?: string;
  sx?: SxObject;
};

/**
 * Shared glass disclosure panel behind every dropdown on the site.
 *
 * Deliberately a plain `GlassContainer` rather than a mouse-aware one: the panel
 * hangs off a trigger inside a capsule that already tilts toward the cursor, so
 * it inherits that tilt. Its own gravity transform would only double it, and the
 * transform would make the panel a containing block and stacking context for no
 * gain.
 *
 * Mount this as a *sibling* of the trigger, never inside another glass surface.
 * `backdrop-filter` makes an element the backdrop root for its whole subtree, and
 * a panel hangs below its trigger's box — so nested in glass it samples an area
 * with nothing behind it and paints fully transparent.
 */
export function GlassDisclosurePanel({
  align = 'end',
  children,
  id,
  isOpen,
  label,
  role,
  sx,
}: GlassDisclosurePanelProps) {
  const isScriptDriven = isOpen !== undefined;
  return (
    <GlassContainer
      aria-hidden={isScriptDriven ? !isOpen : undefined}
      aria-label={label}
      id={id}
      inert={isScriptDriven ? !isOpen : undefined}
      role={role}
      sx={{
        ...panelBaseSx,
        ...alignSx[align],
        ...(isScriptDriven ? createPanelMotionSx(isOpen) : detailsDrivenMotionSx),
        ...sx,
      }}
    >
      {children}
    </GlassContainer>
  );
}

/**
 * Sliding highlight behind the selected row of a single-select disclosure.
 *
 * Absolute inside the row list, so the list must be the positioned ancestor and
 * rows must keep their own stacking above it.
 */
export function GlassDisclosureThumb({ selectedIndex }: { selectedIndex: number }) {
  return (
    <Box
      sx={{
        [REDUCED_MOTION]: { transition: 'none' },
        backgroundColor: 'var(--mui-palette-action-selected)',
        border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
        borderRadius: '999px',
        height: DISCLOSURE_ROW_HEIGHT,
        insetInline: 0,
        position: 'absolute',
        top: 0,
        transform: `translateY(${selectedIndex * (DISCLOSURE_ROW_HEIGHT + DISCLOSURE_ROW_GAP)}px)`,
        transition: createTransition(['background-color', 'transform'], TIMING_MEDIUM),
        zIndex: 0,
      }}
    />
  );
}

/** Row list for a single-select disclosure, positioned for its thumb. */
export const disclosureListSx: SxObject = {
  display: 'grid',
  position: 'relative',
  rowGap: `${DISCLOSURE_ROW_GAP}px`,
};

type GlassDisclosureRowProps = {
  /** Omitted for text-only option sets, which render as full-width rows. */
  icon?: ReactNode;
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
    <Box
      component={component}
      onClick={onClick}
      sx={{ ...rowBaseSx, ...(icon ? undefined : labelOnlyRowSx), ...sx }}
    >
      {children}
      {icon ? (
        <Box aria-hidden component="span" sx={iconCellSx}>
          {icon}
        </Box>
      ) : null}
      <Typography component="span" sx={labelSx} variant="caption">
        {label}
      </Typography>
    </Box>
  );
}
