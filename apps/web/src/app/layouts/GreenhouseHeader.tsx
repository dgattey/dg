import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { GlassContainer } from '@dg/ui/core/GlassContainer';
import { Nav } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import {
  pinnedChromeSx,
  SITE_HEADER_VIEW_TRANSITION_NAME,
} from '@dg/ui/core/transitions/pageTransitions';
import type { SxObject } from '@dg/ui/theme';
import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Box } from '@mui/material';
import { GreenhouseNavLinks } from './GreenhouseNavLinks';
import { Logo } from './Logo';
import { SiteHeaderHeight } from './SiteHeaderHeight';

const stickyContainerSx: SxObject = {
  backgroundColor: 'transparent',
  maxWidth: 'unset',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const siteHeaderSx: SxObject = {
  ...pinnedChromeSx(SITE_HEADER_VIEW_TRANSITION_NAME),
  backgroundColor: 'transparent',
};

/**
 * Flag-off `StickyBarTopMask` paints a cream strip the height of the header
 * whenever `data-sticky-fade` is in the DOM. Greenhouse uses the plate as
 * the backdrop, so that mask must stay off on every greenhouse route.
 */
const hideStickyMask = `
  body:has([data-greenhouse-header]) [data-sticky-mask] {
    display: none !important;
  }
`;

const navSx: SxObject = {
  paddingBlockStart: { sm: 1.5, xs: 1 },
};

const barSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: { sm: 2, xs: 1 },
  px: { sm: 2, xs: 1.5 },
  py: { sm: 1, xs: 1 },
  rowGap: { sm: 0, xs: 0.75 },
  width: '100%',
};

const linksSx: SxObject = {
  display: 'flex',
  flex: { sm: '1 1 auto', xs: '1 1 100%' },
  justifyContent: { sm: 'center', xs: 'flex-start' },
  minWidth: 0,
  order: { sm: 0, xs: 3 },
};

const toggleWrapSx: SxObject = {
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'flex-end',
  marginInlineStart: { sm: 0, xs: 'auto' },
};

/**
 * One glass bar: wordmark, text links, theme toggle. No nested capsules.
 */
export function GreenhouseHeader() {
  return (
    <GreenhouseTypeProvider>
      <style>{hideStickyMask}</style>
      <Section sx={stickyContainerSx}>
        <SiteHeaderHeight />
        <Box
          component="header"
          data-greenhouse-header={true}
          data-site-header={true}
          sx={siteHeaderSx}
        >
          <Nav aria-label="Site" sx={navSx}>
            <GlassContainer data-greenhouse-header-bar={true} sx={barSx}>
              <Logo appearance="wordmark" />
              <Box sx={linksSx}>
                <GreenhouseNavLinks />
              </Box>
              <Box sx={toggleWrapSx}>
                <ColorSchemeToggleClient embedded />
              </Box>
            </GlassContainer>
          </Nav>
        </Box>
      </Section>
    </GreenhouseTypeProvider>
  );
}
