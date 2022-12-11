import { useData } from 'api/useData';
import { Section } from 'ui/Section';
import { Nav, NavGroup, NavItem } from 'ui/Nav';
import { Container } from '@mui/material';
import type { Link as LinkType } from 'api/types/generated/contentfulApi.generated';
import { HorizontalStack } from 'ui/HorizontalStack';
import { Link } from './Link';

const LINK_PADDING_X = 2;
const LINK_PADDING_Y = 1.8;

/**
 * Creates a singular footer link
 */
function FooterLink({ link }: { link: LinkType }) {
  return (
    <NavItem
      sx={(theme) => ({
        paddingX: LINK_PADDING_X,
        [theme.breakpoints.down('lg')]: {
          paddingX: LINK_PADDING_X,
        },
      })}
    >
      <Link
        title={link.title}
        icon={link.icon}
        layout="icon" // the ones that have no icon will resolve to just text
        href={link.url}
        isExternal={link.url?.startsWith('http')}
        aria-label={link.title}
        linkProps={{
          color: 'secondary',
        }}
        sx={{
          // Make the clickable area bigger for a11y
          paddingX: LINK_PADDING_X,
          paddingY: LINK_PADDING_Y,
          marginX: -LINK_PADDING_X,
          marginY: -LINK_PADDING_Y,
        }}
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
            columnGap: 2,
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
          <NavGroup sx={{ columnGap: 4 }} component="div">
            <HorizontalStack component="ul" sx={{ padding: 0, margin: 0 }}>
              {nonIconFooterLinks?.map((link) => (
                <FooterLink link={link} key={link.url} />
              ))}
            </HorizontalStack>
            <HorizontalStack component="ul" sx={{ padding: 0, margin: 0 }}>
              {iconFooterLinks?.map((link) => (
                <FooterLink link={link} key={link.url} />
              ))}
            </HorizontalStack>
          </NavGroup>
        </Nav>
      </footer>
    </Container>
  );
}
