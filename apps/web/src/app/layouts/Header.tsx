import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { MouseAwareGlassContainer } from '@dg/ui/core/MouseAwareGlassContainer';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import {
  pinnedChromeSx,
  SITE_HEADER_VIEW_TRANSITION_NAME,
} from '@dg/ui/core/transitions/pageTransitions';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { CollageColorSchemeFieldset } from '../collage/CollageColorSchemeFieldset';
import chrome from '../collage/chrome.module.css';
import { PaperCard } from '../collage/PaperCard';
import { SpotifyHeaderCard } from '../spotify/SpotifyHeaderCard';
import { CollageMusicLinks } from './CollageMusicLinks';
import { HeaderControls } from './HeaderControls';
import { Logo } from './Logo';
import { SiteHeaderHeight } from './SiteHeaderHeight';

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

const glassContainerSx: SxObject = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 1,
  minWidth: 0,
  px: 2,
  py: 0.75,
};

async function SpotifyHeaderCardSlot({ surface }: { surface: SiteSurface }) {
  const track = await getLatestSong();
  if (!track) {
    return null;
  }
  return <SpotifyHeaderCard surface={surface} track={track} />;
}

export function Header({ surface = 'classic' }: { surface?: SiteSurface }) {
  if (surface === 'collage') {
    return (
      <>
        <SiteHeaderHeight />
        <header className={`collageMeasure ${chrome.header}`} data-sticky-header={true}>
          <PaperCard className={chrome.logo} edge="quad-b" tiltDeg={-4} tone="ochre">
            <div className={chrome.logoInner}>
              <Logo surface="collage" />
            </div>
          </PaperCard>
          <div className={chrome.nowPlaying}>
            <Suspense fallback={null}>
              <SpotifyHeaderCardSlot surface="collage" />
            </Suspense>
          </div>
          <div className={chrome.spacer} />
          <nav className={chrome.nav}>
            <CollageMusicLinks />
            <CollageColorSchemeFieldset />
          </nav>
        </header>
      </>
    );
  }

  return (
    <Section data-sticky-header={true} sx={stickyContainerSx}>
      <SiteHeaderHeight />
      <Box component="header" data-site-header={true} sx={siteHeaderSx}>
        <Nav sx={navSx}>
          <NavGroup sx={{ height: 'auto' }}>
            <NavItem variant="body2">
              <MouseAwareGlassContainer sx={glassContainerSx}>
                <Logo />
                <Suspense fallback={null}>
                  <SpotifyHeaderCardSlot surface="classic" />
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
