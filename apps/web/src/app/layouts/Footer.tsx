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
import { Box, Container, Divider, Stack } from '@mui/material';
import { cacheLife } from 'next/cache';
import { getFooterLinks } from '../../services/contentful';
import { getAppVersionInfo } from '../../services/version';
import chrome from '../collage/chrome.module.css';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import type { SiteSurface } from '../collage/types';
import { FOOTER_ICON_DESKTOP_FONT_SIZE, FOOTER_ICON_FONT_SIZE } from './footerIconSize';

const navItemNoPaddingSx: SxObject = {
  padding: 0,
};

const getFooterLinkSx = (hasIcon: boolean): SxObject => ({
  alignItems: 'center',
  display: 'flex',
  fontSize: hasIcon ? { sm: FOOTER_ICON_DESKTOP_FONT_SIZE, xs: FOOTER_ICON_FONT_SIZE } : undefined,
  justifyContent: 'center',
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
        layout="icon"
        sx={getFooterLinkSx(Boolean(icon))}
        title={title}
        tooltipPlacement="top"
        variant="caption"
      />
    </NavItem>
  );
}

function CollageFooterLink({ link }: { link: RenderableLink }) {
  const { title, url, icon } = link;
  return (
    <Link
      href={url}
      icon={icon ?? undefined}
      isExternal={url.startsWith('http')}
      layout="icon"
      title={title}
      tooltipPlacement="top"
    />
  );
}

// biome-ignore lint/suspicious/useAwait: 'use cache' requires async
async function getCopyrightYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

export async function Footer({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const [footerLinks, versionInfo, currentYear] = await Promise.all([
    getFooterLinks(),
    getAppVersionInfo(),
    getCopyrightYear(),
  ]);
  const nonIconFooterLinks = footerLinks.filter((link) => !link.icon);
  const iconFooterLinks = footerLinks.filter((link) => link.icon);
  const releaseUrl = versionInfo.releaseUrl;
  const version = versionInfo.version;

  if (surface === 'collage') {
    return (
      <footer className={chrome.footer}>
        <PaperCard className={chrome.strip} edge="torn-b" tiltDeg={-0.5} tone="black">
          <div className={chrome.stripInner}>
            <div className={chrome.stripMeta}>
              <span>© {currentYear} Dylan Gattey</span>
              {version ? (
                <>
                  <span className={chrome.dot}>•</span>
                  {releaseUrl ? (
                    <Link
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
                </>
              ) : null}
              <PaperTag edge="quad-c" tiltDeg={2} tone="ochre">
                Redesign on
              </PaperTag>
              {process.env.NODE_ENV !== 'production' ? (
                <>
                  <span className={chrome.dot}>•</span>
                  <Link forcePageNavigation href={devConsoleRoute} title="Developer tools">
                    Dev console
                  </Link>
                </>
              ) : null}
            </div>
            <div className={chrome.links}>
              {nonIconFooterLinks.map((link) => (
                <CollageFooterLink key={link.url} link={link} />
              ))}
              {iconFooterLinks.map((link) => (
                <CollageFooterLink key={link.url} link={link} />
              ))}
            </div>
          </div>
        </PaperCard>
      </footer>
    );
  }

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
