import Footer from './Footer';
import Header from './Header';

/**
 * Basic page layout for every page. Has a sticky, contained header above
 * the main (contained) content, with a (contained) footer below. No wrapper
 * around all items to save on divs.
 */
const Layout = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <>
    <Header />
    <section className="container">
      <main>{children}</main>
    </section>
    <Footer />
  </>
);

export default Layout;
