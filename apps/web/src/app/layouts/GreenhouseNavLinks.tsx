'use client';

import { favoriteAlbumsRoute, homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import { normalizeMusicPath } from './musicHeaderDestinations';

const LINKS = [
  { href: homeRoute, label: 'Home' },
  { href: musicRoute, label: 'Listening' },
  { href: favoriteAlbumsRoute, label: 'Albums' },
] as const;

const listSx: SxObject = {
  alignItems: 'center',
  columnGap: { sm: 2.5, xs: 1.75 },
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: { sm: 'center', xs: 'flex-start' },
  listStyle: 'none',
  margin: 0,
  minWidth: 0,
  padding: 0,
  rowGap: 0.5,
};

const itemSx: SxObject = {
  margin: 0,
  padding: 0,
};

const linkSx: SxObject = {
  '&[aria-current="page"]': {
    color: 'text.primary',
  },
  color: 'text.secondary',
  textDecoration: 'none',
  textWrap: 'nowrap',
};

function isCurrentPath(pathname: string, href: string): boolean {
  const path = normalizeMusicPath(pathname);
  if (href === homeRoute) {
    return path === homeRoute || path === '/greenhouse/home' || path.startsWith('/greenhouse/m1-shot');
  }
  if (href === favoriteAlbumsRoute) {
    return path === favoriteAlbumsRoute || path.startsWith(`${favoriteAlbumsRoute}/`);
  }
  return path === href;
}

/**
 * Plain text destinations for the greenhouse header bar.
 */
export function GreenhouseNavLinks() {
  const pathname = usePathname();

  return (
    <Box component="ul" sx={listSx}>
      {LINKS.map((link) => {
        const current = isCurrentPath(pathname, link.href);
        return (
          <Box component="li" key={link.href} sx={itemSx}>
            <Link
              aria-current={current ? 'page' : undefined}
              color="inherit"
              href={link.href}
              sx={linkSx}
              title={link.label}
              underline="hover"
              variant="body2"
            >
              {link.label}
            </Link>
          </Box>
        );
      })}
    </Box>
  );
}
