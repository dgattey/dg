import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { devConsoleRoute, musicRoute } from '@dg/shared-core/routes/app';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import { SheetOpenLink } from '@dg/ui/core/sheet/SheetOpenLink';
import { SITE_FOOTER_VIEW_TRANSITION_NAME } from '@dg/ui/core/sheet/sheetTransitions';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Container, Divider, Stack } from '@mui/material';
import { cacheLife } from 'next/cache';
import { getFooterLinks } from '../../services/contentful';
import { getAppVersionInfo } from '../../services/version';

const navItemNoPaddingSx: SxObject = {
  padding: 0,
};

const getFooterLinkSx = (hasIcon: boolean): SxObject => ({
  alignItems: 'center',
  display: 'flex',
  fontSize: hasIcon ? '1.25em' : undefined,
  justifyContent: 'center',
  minHeight: 40,
  // Min tap target size
  minWidth: 40,
});

const footerSectionSx: SxObject = {
  marginTop: 12,
};

const footerContainerSx: SxObject = {
  padding: 0,
};

const siteFooterSx: SxObject = {
  viewTransitionName: SITE_FOOTER_VIEW_TRANSITION_NAME,
};

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
  marginLeft: -2.5,
  marginRight: -1.5,
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
 * Creates the site footer component - shows version data + copyright
 */
export async function Footer() {
  const [footerLinks, versionInfo, currentYear] = await Promise.all([
    getFooterLinks(),
    getAppVersionInfo(),
    getCopyrightYear(),
  ]);
  const nonIconFooterLinks = footerLinks.filter((link) => !link.icon);
  const iconFooterLinks = footerLinks.filter((link) => link.icon);
  const releaseUrl = versionInfo.releaseUrl;
  const version = versionInfo.version;
  return (
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
              <NavItem sx={navItemNoPaddingSx}>•</NavItem>
              <NavItem>
                <SheetOpenLink
                  color="inherit"
                  href={musicRoute}
                  morphsTitle
                  title="Listening history"
                  variant="caption"
                >
                  Listening history
                </SheetOpenLink>
              </NavItem>
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
}
