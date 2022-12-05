import { useData } from 'api/useData';
import { Section } from 'ui/Section';
import { containerSx } from 'ui/Container';
import { Nav, NavGroup, NavItem } from 'ui/Nav';
import { SxProps, Theme } from '@mui/material';
import { Link } from './Link';
import { mixinSx } from '../ui/helpers/mixinSx';

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
        {...link}
        isExternal={link.url?.startsWith('http')}
aria-label={link.title}
        sx={(theme) => ({
          textDecoration: 'none',
          color: theme.palette.primary.dark,
          transition: theme.transitions.create('color'),
          '&:hover': {
            color: theme.palette.primary.main,
          },
        })}
      />
    </NavItem>
  ));
  return (
    <Section sx={mixinSx(containerSx, { padding: 0 })}>
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
    </Section>
  );
}
