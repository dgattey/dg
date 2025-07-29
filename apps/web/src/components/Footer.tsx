import { Container, Divider } from '@mui/material';
import type { Link as LinkType } from 'api/contentful/api.generated';
import { useData } from 'api/useData';
import { HorizontalStack } from 'ui/core/HorizontalStack';
import { Nav, NavGroup, NavItem } from 'ui/core/Nav';
import { Section } from 'ui/core/Section';
import { Link } from 'ui/dependent/Link';

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
          variant: 'caption',
        }}
        sx={{
          alignItems: 'center',
          display: 'flex',
          fontSize: link.icon ? '1.25em' : undefined,
          justifyContent: 'center',
          minHeight: 40,
          // Min tap target size
          minWidth: 40,
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
    <Container component={Section} sx={{ marginTop: 12, padding: 0 }}>
      <footer>
        <Divider
          sx={{
            marginBottom: 3,
          }}
        />
        <Nav
          sx={(theme) => ({
            columnGap: 3,
            flexDirection: 'row',
            flexWrap: 'wrap-reverse',
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
          <NavGroup component="div" sx={{ columnGap: 2 }}>
            <HorizontalStack component="ul" sx={{ margin: 0, padding: 0 }}>
              {nonIconFooterLinks?.map((link) => (
                <FooterLink key={link.url} link={link} />
              ))}
            </HorizontalStack>
            <HorizontalStack
              component="ul"
              sx={{
                flex: 1,
                justifyContent: 'space-between',
                margin: 0,
                marginLeft: -2.5,
                marginRight: -1.5,
                padding: 0,
              }}
            >
              {iconFooterLinks?.map((link) => (
                <FooterLink key={link.url} link={link} />
              ))}
            </HorizontalStack>
          </NavGroup>
        </Nav>
      </footer>
    </Container>
  );
}
