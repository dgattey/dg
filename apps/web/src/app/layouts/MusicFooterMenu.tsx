'use client';

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { NavItem } from '@dg/ui/core/Nav';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { pageTitleMorphName } from '@dg/ui/core/transitions/pageTransitions';
import type { SxObject } from '@dg/ui/theme';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Disc3, DiscAlbum, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { FOOTER_ICON_BASE_PX, FOOTER_ICON_FONT_SIZE } from './footerIconSize';
import { isMusicDestinationPath, MUSIC_DESTINATIONS } from './musicFooterDestinations';

const MUSIC_LABEL = 'Music';

const DESTINATION_ICONS: Record<string, LucideIcon> = {
  [favoriteAlbumsRoute]: DiscAlbum,
  [musicRoute]: History,
};

const triggerSx: SxObject = {
  alignItems: 'center',
  color: 'secondary.main',
  display: 'flex',
  fontSize: FOOTER_ICON_FONT_SIZE,
  justifyContent: 'center',
  minHeight: { sm: 40, xs: 36 },
  minWidth: { sm: 40, xs: 36 },
  padding: 0,
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
  minWidth: '12rem',
  mt: -1,
  py: 0.5,
};

const menuItemSx: SxObject = {
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)',
  },
  minHeight: 0,
  px: 1.5,
  py: 0.75,
};

const menuLinkSx: SxObject = {
  color: 'inherit',
  display: 'block',
  fontSize: `${FOOTER_ICON_BASE_PX}px`,
  fontWeight: 500,
  textDecoration: 'none',
  width: '100%',
};

const menuRowSx: SxObject = {
  alignItems: 'center',
  columnGap: 1.25,
  display: 'flex',
  fontSize: `${FOOTER_ICON_BASE_PX}px`,
  lineHeight: 1.3,
  minWidth: 0,
};

/** Explicit px matching caption × FOOTER_ICON_FONT_SIZE (14 × 1.25 = 17.5). */
const MENU_ICON_PX = FOOTER_ICON_BASE_PX * 1.25;
const menuIconSx: SxObject = {
  '& svg': {
    height: `${MENU_ICON_PX}px`,
    width: `${MENU_ICON_PX}px`,
  },
  display: 'inline-flex',
  flexShrink: 0,
  lineHeight: 0,
};

function resolveTriggerIcon(icon?: string | null) {
  if (icon === 'albums') {
    return <Disc3 size="1em" />;
  }
  if (icon) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Contentful may send inline SVG markup
    return <span dangerouslySetInnerHTML={{ __html: icon }} />;
  }
  return <Disc3 size="1em" />;
}

type MusicFooterMenuProps = {
  icon?: string | null;
};

/**
 * Footer vinyl control: opens a small menu of music destinations. The trigger
 * alone owns the page-title view-transition name so menu item links never
 * collide. Scroll lock is off so sticky header chrome stays pinned while open.
 */
export function MusicFooterMenu({ icon }: MusicFooterMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const destinationIsOpen = isMusicDestinationPath(pathname);

  useLayoutEffect(() => {
    if (!triggerRef.current) {
      return;
    }
    triggerRef.current.style.viewTransitionName = pageTitleMorphName(destinationIsOpen);
  }, [destinationIsOpen]);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchor(null);
  };

  return (
    <NavItem sx={{ padding: 0 }}>
      <Tooltip placement="top" title={MUSIC_LABEL}>
        <IconButton
          aria-controls={menuAnchor ? menuId : undefined}
          aria-expanded={menuAnchor ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label={MUSIC_LABEL}
          onClick={handleOpen}
          ref={triggerRef}
          sx={triggerSx}
        >
          {resolveTriggerIcon(icon)}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchor}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        disableScrollLock
        id={menuId}
        onClose={handleClose}
        open={Boolean(menuAnchor)}
        slotProps={{ paper: { sx: menuPaperSx } }}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
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
                    <Icon aria-hidden size={MENU_ICON_PX} />
                  </Box>
                  <Box component="span">{destination.label}</Box>
                </Box>
              </PageTransitionLink>
            </MenuItem>
          );
        })}
      </Menu>
    </NavItem>
  );
}
