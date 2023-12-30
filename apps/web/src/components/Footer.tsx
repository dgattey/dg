import { Container } from '@mui/material';
import { Section } from 'ui/core/Section';
import { Nav, NavGroup, NavItem } from 'ui/core/Nav';
import { HorizontalStack } from 'ui/core/HorizontalStack';
import type { Link as LinkType } from 'api/server/contentful/api.generated';
import { useData } from 'api/useData';
import { Link } from './Link';

/**
 * Creates a singular footer link
 */
function FooterLink({ link }: { link: LinkType }) {
  return (
    <NavItem sx={{ padding: 0 }}>
      <Link
        aria-label={link.title}
        href={link.url}
        icon={link.icon}
        isExternal={link.url?.startsWith('http')}
        layout="icon" // the ones that have no icon will resolve to just text
        linkProps={{
          color: 'secondary',
        }}
        sx={{
          // Min tap target size
          minWidth: 48,
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={link.title}
      />
    </NavItem>
  );
}

/**
 * Creates the site footer component - shows version data + copyright
 */
export function Footer() {
  const { data: version } = useData('version');
  const { data: footerLinks } = useData('footer');
  const nonIconFooterLinks = footerLinks?.filter((link) => !link.icon);
  const iconFooterLinks = footerLinks?.filter((link) => link.icon);
  return (
    <Container component={Section} sx={{ padding: 0 }}>
      <footer>
        <Nav
          sx={(theme) => ({
            flexDirection: 'row',
            flexWrap: 'wrap-reverse',
            columnGap: 3,
            marginTop: 8,
            [theme.breakpoints.down('sm')]: {
              flexDirection: 'column-reverse',
            },
          })}
        >
          <NavGroup>
            <NavItem>© {new Date().getFullYear()} Dylan Gattey</NavItem>
            <NavItem sx={{ padding: 0 }}>•</NavItem>
            <NavItem>{version}</NavItem>
          </NavGroup>
          <NavGroup component="div" sx={{ columnGap: 4 }}>
            <HorizontalStack component="ul" sx={{ padding: 0, margin: 0 }}>
              {nonIconFooterLinks?.map((link) => <FooterLink key={link.url} link={link} />)}
            </HorizontalStack>
            <HorizontalStack
              component="ul"
              sx={{
                padding: 0,
                margin: 0,
                flex: 1,
                marginLeft: -1.5,
                marginRight: -1.5,
                justifyContent: 'space-between',
              }}
            >
              {iconFooterLinks?.map((link) => <FooterLink key={link.url} link={link} />)}
            </HorizontalStack>
          </NavGroup>
        </Nav>
      </footer>
    </Container>
  );
}
