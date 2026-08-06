'use client';

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { pageTitleMorphName } from '@dg/ui/core/transitions/pageTransitions';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Disc3, DiscAlbum, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useId, useLayoutEffect, useRef } from 'react';
import { isMusicDestinationPath, MUSIC_DESTINATIONS } from './musicHeaderDestinations';

const MUSIC_LABEL = 'Music';
const ICON_SIZE = 22;
const ROW_HEIGHT = 48;
const EXPANDED_WIDTH = 176;

const DESTINATION_ICONS: Record<string, LucideIcon> = {
  [favoriteAlbumsRoute]: DiscAlbum,
  [musicRoute]: History,
};

const anchorSx: SxObject = {
  display: 'block',
  height: ROW_HEIGHT,
  position: 'relative',
  width: ROW_HEIGHT,
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
  height: ROW_HEIGHT,
  justifyContent: 'center',
  padding: 0,
  width: ROW_HEIGHT,
};

const menuPaperSx: SxObject = {
  backdropFilter: 'blur(12px) saturate(150%)',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent)',
  border: '1px solid color-mix(in srgb, CanvasText 12%, transparent)',
  borderRadius: 2,
  boxShadow: `
    inset 0 1px 0 color-mix(in srgb, var(--mui-palette-common-white) 15%, transparent),
    0px 1px 5px color-mix(in srgb, var(--mui-palette-common-black) 12%, transparent),
    0px 6px 16px color-mix(in srgb, var(--mui-palette-common-black) 8%, transparent)`,
  minWidth: EXPANDED_WIDTH,
  mt: 0.5,
  py: 1,
};

const menuItemSx: SxObject = {
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)',
  },
  borderRadius: '999px',
  minHeight: ROW_HEIGHT,
  mx: 1,
  px: 0,
  py: 0,
};

const menuLinkSx: SxObject = {
  alignItems: 'center',
  color: 'inherit',
  display: 'grid',
  fontSize: 'inherit',
  fontWeight: 500,
  gridTemplateColumns: `${ROW_HEIGHT}px 1fr`,
  height: ROW_HEIGHT,
  textDecoration: 'none',
  width: '100%',
};

const menuRowSx: SxObject = {
  alignItems: 'center',
  display: 'contents',
  lineHeight: 1.3,
  minWidth: 0,
};

const menuIconSx: SxObject = {
  '& svg': {
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
  display: 'grid',
  flexShrink: 0,
  placeItems: 'center',
};

type MusicHeaderMenuProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/**
 * Header vinyl control: opens a glass menu of music destinations. The trigger
 * alone owns the page-title view-transition name so menu item links never
 * collide. Scroll lock stays off so sticky header chrome remains pinned.
 */
export function MusicHeaderMenu({ isOpen, onOpenChange }: MusicHeaderMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const destinationIsOpen = isMusicDestinationPath(pathname);

  useLayoutEffect(() => {
    if (!triggerRef.current) {
      return;
    }
    triggerRef.current.style.viewTransitionName = pageTitleMorphName(destinationIsOpen);
  }, [destinationIsOpen]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Box sx={anchorSx}>
      <Tooltip placement="bottom" title={MUSIC_LABEL}>
        <IconButton
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label={MUSIC_LABEL}
          onClick={() => onOpenChange(!isOpen)}
          ref={triggerRef}
          sx={triggerSx}
        >
          <Disc3 size={ICON_SIZE} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={triggerRef.current}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        disableScrollLock
        id={menuId}
        onClose={handleClose}
        open={isOpen}
        slotProps={{ paper: { sx: menuPaperSx } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {MUSIC_DESTINATIONS.map((destination) => {
          const Icon = DESTINATION_ICONS[destination.href] ?? Disc3;
          return (
            <MenuItem key={destination.href} onClick={handleClose} sx={menuItemSx}>
              <PageTransitionLink
                href={destination.href}
                sx={menuLinkSx}
                title={destination.label}
                variant="caption"
              >
                <Box component="span" sx={menuRowSx}>
                  <Box component="span" sx={menuIconSx}>
                    <Icon aria-hidden size={ICON_SIZE} />
                  </Box>
                  <Box component="span">{destination.label}</Box>
                </Box>
              </PageTransitionLink>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
