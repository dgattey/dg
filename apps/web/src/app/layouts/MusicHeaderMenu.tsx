'use client';

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import {
  DISCLOSURE_ICON_SIZE,
  DISCLOSURE_ROW_HEIGHT,
  GlassDisclosurePanel,
  GlassDisclosureRow,
} from '@dg/ui/core/GlassDisclosurePanel';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { pageTitleMorphName } from '@dg/ui/core/transitions/pageTransitions';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, IconButton } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Disc3, DiscAlbum, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { FocusEvent, KeyboardEvent } from 'react';
import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { isMusicDestinationPath, MUSIC_DESTINATIONS } from './musicHeaderDestinations';

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
  color: 'var(--mui-palette-primary-main)',
  display: 'flex',
  height: DISCLOSURE_ROW_HEIGHT,
  justifyContent: 'center',
  padding: 0,
  width: DISCLOSURE_ROW_HEIGHT,
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
 * The trigger alone owns the page-title view-transition name so menu item links
 * never collide.
 */
export function MusicHeaderMenu({ isOpen, onOpenChange }: MusicHeaderMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const destinationIsOpen = isMusicDestinationPath(pathname);

  useLayoutEffect(() => {
    if (!triggerRef.current) {
      return;
    }
    triggerRef.current.style.viewTransitionName = pageTitleMorphName(destinationIsOpen);
  }, [destinationIsOpen]);

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
    <Box onBlur={handleFocusOut} onKeyDown={handleRootKeyDown} ref={rootRef} sx={anchorSx}>
      <Tooltip placement="bottom" title={MUSIC_LABEL}>
        <IconButton
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={MUSIC_LABEL}
          onClick={() => onOpenChange(!isOpen)}
          ref={triggerRef}
          sx={triggerSx}
        >
          <Disc3 size={DISCLOSURE_ICON_SIZE} />
        </IconButton>
      </Tooltip>
      <GlassDisclosurePanel id={menuId} isOpen={isOpen} label={MUSIC_LABEL} role="menu">
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
