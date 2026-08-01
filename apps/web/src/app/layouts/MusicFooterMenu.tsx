'use client';

import { NavItem } from '@dg/ui/core/Nav';
import { SheetOpenLink } from '@dg/ui/core/sheet/SheetOpenLink';
import { sheetTitleMorphName } from '@dg/ui/core/sheet/sheetTransitions';
import { Tooltip } from '@dg/ui/core/Tooltip';
import type { SxObject } from '@dg/ui/theme';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Disc3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { isMusicSheetPath, MUSIC_SHEET_ROUTES } from './musicFooterDestinations';

const triggerSx: SxObject = {
  alignItems: 'center',
  color: 'secondary.main',
  display: 'flex',
  fontSize: '1.25em',
  justifyContent: 'center',
  minHeight: 40,
  minWidth: 40,
  padding: 0,
};

const menuLinkSx: SxObject = {
  color: 'inherit',
  display: 'block',
  px: 2,
  py: 1,
  textDecoration: 'none',
  width: '100%',
};

const menuItemSx: SxObject = {
  p: 0,
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
  title: string;
};

/**
 * Footer vinyl control: opens a small menu of music sheets. The trigger alone
 * owns the sheet-title view-transition name so menu item links never collide.
 */
export function MusicFooterMenu({ icon, title }: MusicFooterMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const sheetIsOpen = isMusicSheetPath(pathname);

  useLayoutEffect(() => {
    if (!triggerRef.current) {
      return;
    }
    triggerRef.current.style.viewTransitionName = sheetTitleMorphName(sheetIsOpen);
  }, [sheetIsOpen]);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchor(null);
  };

  return (
    <NavItem sx={{ padding: 0 }}>
      <Tooltip placement="top" title={title}>
        <IconButton
          aria-controls={menuAnchor ? menuId : undefined}
          aria-expanded={menuAnchor ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label={title}
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
        id={menuId}
        onClose={handleClose}
        open={Boolean(menuAnchor)}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        {MUSIC_SHEET_ROUTES.map((destination) => (
          <MenuItem key={destination.href} onClick={handleClose} sx={menuItemSx}>
            <SheetOpenLink href={destination.href} sx={menuLinkSx} title={destination.label}>
              {destination.label}
            </SheetOpenLink>
          </MenuItem>
        ))}
      </Menu>
    </NavItem>
  );
}
