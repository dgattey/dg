import useData from 'api/useData';
import Link from 'next/link';

/**
 * Creates the site header component - shows header links
 */
const Header = () => {
  const { data: siteHeader } = useData('siteHeader');
  const { links } = siteHeader ?? {};
  return (
    <header>
      <p>
        {links &&
          links.map(
            ({ title, url }) =>
              url &&
              title && (
                <Link key={url} href={url}>
                  {title}
                </Link>
              ),
          )}
      </p>
    </header>
  );
};

export default Header;
