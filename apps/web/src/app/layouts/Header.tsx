import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box } from '@dg/ui/core/Box';
import { MouseAwareGlassContainer } from '@dg/ui/core/MouseAwareGlassContainer';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import {
  pinnedChromeSx,
  SITE_HEADER_VIEW_TRANSITION_NAME,
} from '@dg/ui/core/transitions/pageTransitions';
import type { SxObject } from '@dg/ui/theme';
import { Suspense } from 'react';
import { getLastKnownSong, getLatestSong } from '../../services/spotify';
import { CollageColorSchemeFieldset } from '../collage/CollageColorSchemeFieldset';
import { PublishNowPlaying } from '../spotify/NowPlayingContext';
import { SpotifyHeaderCard } from '../spotify/SpotifyHeaderCard';
import { CollageMusicLinks } from './CollageMusicLinks';
import { HeaderControls } from './HeaderControls';
import { Logo } from './Logo';
import { SiteHeaderHeight } from './SiteHeaderHeight';

// Makes the header bar sticky and not responsive to user events by default
const stickyContainerSx: SxObject = {
  maxWidth: 'unset',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const siteHeaderSx: SxObject = pinnedChromeSx(SITE_HEADER_VIEW_TRANSITION_NAME);

const navSx: SxObject = {
  alignItems: 'stretch',
  columnGap: { sm: 2, xs: 1.5 },
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
 * Header card from the last-known song, so the prerendered shell
 * already holds the card's final box instead of it streaming in and pushing
 * the header taller.
 */
async function LastKnownSpotifyHeaderCard({ surface = 'collage' }: { surface?: SiteSurface }) {
  const track = await getLastKnownSong();
  if (!track) {
    return null;
  }
  return <SpotifyHeaderCard surface={surface} track={track} />;
}

/** Streams the live song in and publishes it to the shell's header and body cards. */
async function LiveNowPlaying() {
  const track = await getLatestSong();
  return track ? <PublishNowPlaying track={track} /> : null;
}

/**
 * Creates the site header component with glass background behind logo + music.
 * Logo and header controls are server-rendered immediately.
 * Both surfaces prerender the last-known song and stream only the live update.
 */
export function Header({ surface = 'classic' }: { surface?: SiteSurface }) {
  if (surface === 'collage') {
    return (
      <>
        <SiteHeaderHeight />
        <header className="collageMeasure chrome__header" data-sticky-header={true}>
          <MouseAwareGlassContainer sx={glassContainerSx}>
            <Logo />
          </MouseAwareGlassContainer>
          <div className="chrome__nowPlaying collageLift">
            <LastKnownSpotifyHeaderCard surface="collage" />
            <Suspense fallback={null}>
              <LiveNowPlaying />
            </Suspense>
          </div>
          <div className="chrome__spacer" />
          <nav className="chrome__nav">
            <CollageMusicLinks />
            <CollageColorSchemeFieldset />
          </nav>
        </header>
      </>
    );
  }

  return (
    <Section sx={stickyContainerSx}>
      <SiteHeaderHeight />
      <Box component="header" data-site-header={true} sx={siteHeaderSx}>
        <Nav sx={navSx}>
          <NavGroup sx={{ height: 'auto' }}>
            <NavItem variant="body2">
              <MouseAwareGlassContainer sx={glassContainerSx}>
                <Logo />
                <LastKnownSpotifyHeaderCard surface="classic" />
                <Suspense fallback={null}>
                  <LiveNowPlaying />
                </Suspense>
              </MouseAwareGlassContainer>
            </NavItem>
          </NavGroup>
          <NavGroup sx={{ flexShrink: 0, height: 'auto', justifyContent: 'flex-end' }}>
            <NavItem sx={{ alignItems: 'center', display: 'flex', paddingInline: 0 }}>
              <HeaderControls />
            </NavItem>
          </NavGroup>
        </Nav>
      </Box>
    </Section>
  );
}
