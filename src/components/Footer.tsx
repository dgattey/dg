import useData from 'api/useData';
import styled from 'styled-components';
import Link from './Link';

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

/**
 * Creates the site footer component - shows version data + copyright
 */
const Footer = () => {
  const { data: version } = useData('version');
  const { data: footerLinks } = useData('siteFooter');
  const listedLinkElements = footerLinks?.map((link) => (
    <li key={link.url}>
      <Link {...link} />
    </li>
  ));
  return (
    <section className="container">
      <footer>
        <Navigation>
          <FlexList>
            <li>© {new Date().getFullYear()} Dylan Gattey</li>
            <li>{version}</li>
          </FlexList>
          <FlexList>{listedLinkElements}</FlexList>
        </Navigation>
      </footer>
    </section>
  );
};

export default Footer;
