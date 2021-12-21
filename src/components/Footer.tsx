import useData from 'api/useData';

/**
 * Creates the site footer component - shows version data + copyright
 */
const Footer = () => {
  const { data: version } = useData('version');
  return (
    <footer>
      <p>
        © {new Date().getFullYear()} Dylan Gattey | {version} |{' '}
      </p>
    </footer>
  );
};

export default Footer;
