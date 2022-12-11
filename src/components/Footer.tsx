import { useData } from 'api/useData';
import { Section } from 'ui/Section';
import { Nav, NavGroup, NavItem } from 'ui/Nav';
import { SxProps, Theme, Container } from '@mui/material';
import { Link } from './Link';

// Wraps so it can collapse better on mobile
const navGroupSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
};

/**
 * Creates the site footer component - shows version data + copyright
 */
export function Footer() {
  const { data: version } = useData('version');
  const { data: footerLinks } = useData('footer');
  const listedLinkElements = footerLinks?.map((link) => (
    <NavItem
      key={link.url}
      sx={{
        paddingX: 1.15,
      }}
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
      />
    </NavItem>
  ));
  return (
    <Container component={Section} sx={{ padding: 0 }}>
      <footer>
        <Nav
          sx={(theme) => ({
            flexDirection: 'column',
            [theme.breakpoints.up('md')]: {
              flexDirection: 'row',
            },
          })}
        >
          <NavGroup sx={navGroupSx}>
            <NavItem>© {new Date().getFullYear()} Dylan Gattey</NavItem>
            <NavItem sx={{ padding: 0 }}>•</NavItem>
            <NavItem>{version}</NavItem>
          </NavGroup>
          <NavGroup sx={navGroupSx}>{listedLinkElements}</NavGroup>
        </Nav>
      </footer>
    </Container>
  );
}
