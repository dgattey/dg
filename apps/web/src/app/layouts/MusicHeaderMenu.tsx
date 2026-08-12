'use client';

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import {
  DISCLOSURE_ICON_SIZE,
  DISCLOSURE_ROW_HEIGHT,
  disclosureHostProps,
  GlassDisclosurePanel,
  GlassDisclosureRow,
} from '@dg/ui/core/GlassDisclosurePanel';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Disc3, DiscAlbum, History } from 'lucide-react';
import type { FocusEvent, KeyboardEvent } from 'react';
import { useEffect, useId, useRef } from 'react';
import { MUSIC_DESTINATIONS } from './musicHeaderDestinations';

const MUSIC_LABEL = 'Music';

const DESTINATION_ICONS: Record<string, LucideIcon> = {
  [favoriteAlbumsRoute]: DiscAlbum,
  [musicRoute]: History,
};

const ARROW_STEPS: Record<string, number | undefined> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};

const anchorSx: SxObject = {
  display: 'block',
  height: DISCLOSURE_ROW_HEIGHT,
  position: 'relative',
  width: DISCLOSURE_ROW_HEIGHT,
};

/**
 * Holds nothing but the trigger. The panel is a sibling rather than this
 * element's content, so it is ours to animate — a `<details>` hides its own
 * content outright, which would cut the open and close motion — and so it never
 * ends up nested in the capsule's glass.
 */
const detailsSx: SxObject = {
  display: 'block',
};

/**
 * The `<summary>` is the trigger. It carries the disclosure state the platform
 * tracks for us, which is the whole reason a keyboard and a screen reader still
 * agree with the screen when there is no script to keep `aria-expanded` honest.
 */
const triggerSx: SxObject = {
  '& svg': {
    ...createBouncyTransition('scale'),
    display: 'block',
  },
  '&::-webkit-details-marker': {
    display: 'none',
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
  display: 'flex',
  height: DISCLOSURE_ROW_HEIGHT,
  justifyContent: 'center',
  /* Both spellings: `list-style` covers the marker everywhere but WebKit. */
  listStyle: 'none',
  width: DISCLOSURE_ROW_HEIGHT,
};

/** Fills the trigger so the whole 48px target reveals the hint, not just the glyph. */
const tooltipAnchorSx: SxObject = {
  alignItems: 'center',
  height: '100%',
  justifyContent: 'center',
  width: '100%',
};

const destinationLinkSx: SxObject = {
  color: 'inherit',
  display: 'block',
  textDecoration: 'none',
  width: '100%',
};

type MusicHeaderMenuProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/**
 * Header vinyl control: opens a shared glass disclosure of music destinations.
 *
 * The `<details>` element owns the open state, so the menu opens and its links
 * work with scripting off. React follows that state rather than owning it, and
 * only pushes back when the sibling theme disclosure takes over — which is what
 * keeps the two mutually exclusive without either fighting the DOM.
 *
 * The trigger must stay unnamed. Sharing `page-title` with the destination
 * heading pairs a 48px disc in the northeast header with a full-width h1 —
 * a ~1000px, 23× FLIP that is the title flying in from the corner. Sibling
 * music headings still share `page-title` so that morph stays local.
 */
export function MusicHeaderMenu({ isOpen, onOpenChange }: MusicHeaderMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mirror a caller-driven close onto the element that actually holds the state
  useEffect(() => {
    const details = detailsRef.current;
    if (details && details.open !== isOpen) {
      details.open = isOpen;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const links = listRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]');
    links?.[0]?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
    };
  }, [isOpen, onOpenChange]);

  const collapse = () => {
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isOpen && event.key === 'Escape') {
      event.preventDefault();
      collapse();
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      collapse();
      return;
    }
    const links = [...(listRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])];
    if (links.length === 0) {
      return;
    }
    const currentIndex =
      document.activeElement instanceof HTMLAnchorElement
        ? links.indexOf(document.activeElement)
        : -1;
    const step = ARROW_STEPS[event.key];
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? links.length - 1
          : step === undefined || currentIndex === -1
            ? -1
            : (currentIndex + step + links.length) % links.length;
    if (nextIndex === -1) {
      return;
    }
    event.preventDefault();
    links[nextIndex]?.focus();
  };

  const handleFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (isOpen && !event.currentTarget.contains(event.relatedTarget)) {
      onOpenChange(false);
    }
  };

  return (
    <Box
      {...disclosureHostProps}
      onBlur={handleFocusOut}
      onKeyDown={handleRootKeyDown}
      ref={rootRef}
      sx={anchorSx}
    >
      <Box
        component="details"
        onToggle={() => onOpenChange(detailsRef.current?.open ?? false)}
        ref={detailsRef}
        sx={detailsSx}
      >
        <Box
          aria-controls={menuId}
          aria-haspopup="menu"
          aria-label={MUSIC_LABEL}
          component="summary"
          ref={triggerRef}
          sx={triggerSx}
        >
          {/* Named by the trigger's own label, so the hint is decoration only. */}
          <Tooltip placement="bottom" sx={tooltipAnchorSx} title={MUSIC_LABEL}>
            <Disc3 aria-hidden size={DISCLOSURE_ICON_SIZE} />
          </Tooltip>
        </Box>
      </Box>
      <GlassDisclosurePanel id={menuId} label={MUSIC_LABEL} role="menu">
        <Box onKeyDown={handleListKeyDown} ref={listRef} sx={{ display: 'contents' }}>
          {MUSIC_DESTINATIONS.map((destination) => {
            const Icon = DESTINATION_ICONS[destination.href] ?? Disc3;
            return (
              <PageTransitionLink
                href={destination.href}
                key={destination.href}
                onClick={collapse}
                role="menuitem"
                sx={destinationLinkSx}
                title={destination.label}
              >
                <GlassDisclosureRow
                  icon={<Icon aria-hidden size={DISCLOSURE_ICON_SIZE} />}
                  label={destination.label}
                />
              </PageTransitionLink>
            );
          })}
        </Box>
      </GlassDisclosurePanel>
    </Box>
  );
}
