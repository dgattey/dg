import type { Link as LinkType } from '@dg/services/contentful/api.generated';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Container, Divider, Stack } from '@mui/material';
import { cacheLife } from 'next/cache';
import { getFooterLinks } from '../services/contentful';
import { getAppVersion } from '../services/version';

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
function FooterLink({ link }: { link: LinkType }) {
  return (
    <NavItem sx={navItemNoPaddingSx}>
      <Link
        aria-label={link.title}
        color="secondary"
        href={link.url}
        icon={link.icon}
        isExternal={link.url?.startsWith('http')}
        layout="icon" // the ones that have no icon will resolve to just text
        sx={getFooterLinkSx(Boolean(link.icon))}
        title={link.title}
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
  const [footerLinks, version, currentYear] = await Promise.all([
    getFooterLinks(),
    getAppVersion(),
    getCopyrightYear(),
  ]);
  const nonIconFooterLinks = footerLinks.filter((link) => !link.icon);
  const iconFooterLinks = footerLinks.filter((link) => link.icon);
  return (
    <Section sx={footerSectionSx}>
      <Container sx={footerContainerSx}>
        <footer>
          <Divider sx={dividerSx} />
          <Nav sx={footerNavSx}>
            <NavGroup>
              <NavItem>© {currentYear} Dylan Gattey</NavItem>
              <NavItem sx={navItemNoPaddingSx}>•</NavItem>
              <NavItem>{version ?? ''}</NavItem>
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
        </footer>
      </Container>
    </Section>
  );
}
