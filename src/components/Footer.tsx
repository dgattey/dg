import { useData } from 'api/useData';
import styled from '@emotion/styled';
import { Link } from './Link';

// Switches to two rows for mobile
const Navigation = styled.nav`
  flex-direction: column;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

// Wraps so it can collapse better on mobile
const FlexList = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;

const NoSpaceItem = styled.li`
  padding: 0;
`;

/**
 * Creates the site footer component - shows version data + copyright
 */
export function Footer() {
  const { data: version } = useData('version');
  const { data: footerLinks } = useData('footer');
  const listedLinkElements = footerLinks?.map((link) => (
    <li key={link.url}>
      <Link {...link} isExternal={link.url?.startsWith('http')} />
    </li>
  ));
  return (
    <section className="container">
      <footer>
        <Navigation>
          <FlexList>
            <li>© {new Date().getFullYear()} Dylan Gattey</li>
            <NoSpaceItem>•</NoSpaceItem>
            <li>{version}</li>
          </FlexList>
          <FlexList>{listedLinkElements}</FlexList>
        </Navigation>
      </footer>
    </section>
  );
}
