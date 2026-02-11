import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { MouseAwareGlassContainer } from '@dg/ui/core/MouseAwareGlassContainer';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import type { SxObject } from '@dg/ui/theme';
import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { SpotifyHeaderCard } from '../spotify/SpotifyHeaderCard';
import { Logo } from './Logo';

// Makes the header bar sticky and not responsive to user events by default
const stickyContainerSx: SxObject = {
  maxWidth: 'unset',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const navSx: SxObject = {
  columnGap: { sm: 2, xs: 1 },
};

/** Glass container with logo + music content */
const glassContainerSx: SxObject = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 1,
  minWidth: 0,
  px: 2,
  py: 0.75,
};

/**
 * Async slot for Spotify header card. Fetches track data server-side.
 * Wrapped in Suspense because getLatestSong accesses runtime data (cookies).
 */
async function SpotifyHeaderCardSlot() {
  const track = await getLatestSong();
  if (!track) {
    return null;
  }
  return <SpotifyHeaderCard track={track} />;
}

/**
 * Creates the site header component with glass background behind logo + music.
 * Logo and color scheme toggle are server-rendered immediately.
 * Music card streams in via Suspense to avoid blocking.
 */
export function Header() {
  return (
    <Section sx={stickyContainerSx}>
      <header data-site-header={true}>
        <Nav sx={navSx}>
          <NavGroup>
            <NavItem variant="body2">
              <MouseAwareGlassContainer sx={glassContainerSx}>
                <Logo />
                <Suspense fallback={null}>
                  <SpotifyHeaderCardSlot />
                </Suspense>
              </MouseAwareGlassContainer>
            </NavItem>
          </NavGroup>
          <NavGroup sx={{ flexShrink: 0 }}>
            <NavItem sx={{ alignItems: 'center', display: 'flex' }}>
              <Suspense fallback={null}>
                <ColorSchemeToggleClient initialValue="system" />
              </Suspense>
            </NavItem>
          </NavGroup>
        </Nav>
      </header>
    </Section>
  );
}
