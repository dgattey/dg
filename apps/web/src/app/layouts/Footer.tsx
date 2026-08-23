import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import {
  pinnedChromeSx,
  SITE_FOOTER_VIEW_TRANSITION_NAME,
} from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import { interactiveRedesign } from '../../flags';
import { getFooterLinks } from '../../services/contentful';
import { getAppVersionInfo } from '../../services/version';
import { FOOTER_ICON_DESKTOP_FONT_SIZE, FOOTER_ICON_FONT_SIZE } from './footerIconSize';
import { shouldUseGreenhouseChrome } from './greenhouseChrome';

const navItemNoPaddingSx: SxObject = {
  padding: 0,
};

const getFooterLinkSx = (hasIcon: boolean): SxObject => ({
  alignItems: 'center',
  display: 'flex',
  fontSize: hasIcon ? { sm: FOOTER_ICON_DESKTOP_FONT_SIZE, xs: FOOTER_ICON_FONT_SIZE } : undefined,
  justifyContent: 'center',
  // Slightly tighter on mobile so the icon row fits; 36px is below the
  // ideal 44px a11y target (desktop stays at 40, already a trade-off).
  minHeight: { sm: 40, xs: 36 },
  minWidth: { sm: 40, xs: 36 },
});

const footerSectionSx: SxObject = {
  marginTop: 12,
};

const footerContainerSx: SxObject = {
  padding: 0,
};

const siteFooterSx: SxObject = pinnedChromeSx(SITE_FOOTER_VIEW_TRANSITION_NAME);

const dividerSx: SxObject = {
  marginBottom: 3,
};

const footerNavSx: SxObject = {
  alignItems: { sm: 'center', xs: 'stretch' },
  columnGap: 3,
  flexDirection: { sm: 'row', xs: 'column-reverse' },
  flexWrap: 'wrap-reverse',
};

const footerNavGroupSx: SxObject = {
  columnGap: 2,
};

const footerLinkListSx: SxObject = {
  margin: 0,
  padding: 0,
};

const footerIconLinkListSx: SxObject = {
  flex: 1,
  justifyContent: 'space-between',
  margin: 0,
  marginLeft: { sm: -2.5, xs: -3 },
  marginRight: { sm: -1.5, xs: -2 },
  padding: 0,
};

/**
 * Creates a singular footer link with top-positioned tooltip
 */
function FooterLink({ link }: { link: RenderableLink }) {
  const { title, url, icon } = link;
  return (
    <NavItem sx={navItemNoPaddingSx}>
      <Link
        aria-label={title}
        color="secondary"
        href={url}
        icon={icon ?? undefined}
        isExternal={url.startsWith('http')}
        layout="icon" // the ones that have no icon will resolve to just text
        sx={getFooterLinkSx(Boolean(icon))}
        title={title}
        tooltipPlacement="top"
        variant="caption"
      />
    </NavItem>
  );
}

/**
 * Returns the current year for copyright display, cached to avoid prerender issues.
 */
// biome-ignore lint/suspicious/useAwait: 'use cache' requires async
async function getCopyrightYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

/**
 * Quiet footer badge when the interactive-redesign flag is on.
 * Wrapped in Suspense because flag evaluation reads request-time data.
 */
export async function RedesignBadge() {
  if (!(await interactiveRedesign())) {
    return null;
  }
  return (
    <>
      <NavItem sx={navItemNoPaddingSx}>•</NavItem>
      <NavItem>
        <Typography color="text.secondary" component="span" variant="caption">
          redesign on
        </Typography>
      </NavItem>
    </>
  );
}

/**
 * Creates the site footer component - shows version data + copyright
 */
export async function Footer() {
  const [footerLinks, versionInfo, currentYear, greenhouse] = await Promise.all([
    getFooterLinks().catch(() => []),
    getAppVersionInfo(),
    getCopyrightYear(),
    shouldUseGreenhouseChrome(),
  ]);
  const nonIconFooterLinks = footerLinks.filter((link) => !link.icon);
  const iconFooterLinks = footerLinks.filter((link) => link.icon);
  const releaseUrl = versionInfo.releaseUrl;
  const version = versionInfo.version;
  const footer = (
    <Section sx={footerSectionSx}>
      <Container sx={footerContainerSx}>
        <Box component="footer" sx={siteFooterSx}>
          <Divider sx={dividerSx} />
          <Nav sx={footerNavSx}>
            <NavGroup>
              <NavItem>© {currentYear} Dylan Gattey</NavItem>
              {version ? (
                <>
                  <NavItem sx={navItemNoPaddingSx}>•</NavItem>
                  <NavItem>
                    {releaseUrl ? (
                      <Link
                        aria-label={`GitHub release ${version}`}
                        color="inherit"
                        href={releaseUrl}
                        isExternal
                        title={`GitHub release ${version}`}
                        variant="caption"
                      >
                        {version}
                      </Link>
                    ) : (
                      version
                    )}
                  </NavItem>
                </>
              ) : null}
              <Suspense fallback={null}>
                <RedesignBadge />
              </Suspense>
              {process.env.NODE_ENV !== 'production' ? (
                <>
                  <NavItem sx={navItemNoPaddingSx}>•</NavItem>
                  <NavItem>
                    <Link
                      aria-label="Developer tools"
                      color="inherit"
                      forcePageNavigation
                      href={devConsoleRoute}
                      title="Developer tools"
                      variant="caption"
                    >
                      Dev console
                    </Link>
                  </NavItem>
                </>
              ) : null}
            </NavGroup>
            <NavGroup component="div" sx={footerNavGroupSx}>
              <Stack component="ul" direction="row" sx={footerLinkListSx}>
                {nonIconFooterLinks?.map((link) => (
                  <FooterLink key={link.url} link={link} />
                ))}
              </Stack>
              <Stack component="ul" direction="row" sx={footerIconLinkListSx}>
                {iconFooterLinks?.map((link) => (
                  <FooterLink key={link.url} link={link} />
                ))}
              </Stack>
            </NavGroup>
          </Nav>
        </Box>
      </Container>
    </Section>
  );
  if (greenhouse) {
    return <GreenhouseTypeProvider>{footer}</GreenhouseTypeProvider>;
  }
  return footer;
}
