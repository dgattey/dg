import useData from 'api/useData';
import Link from './Link';

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
    <footer>
      <nav>
        <ul>
          <li>© {new Date().getFullYear()} Dylan Gattey</li>
          <li>{version}</li>
        </ul>
        <ul>{listedLinkElements}</ul>
      </nav>
    </footer>
  );
};

export default Footer;
