import Footer from './Footer';
import Header from './Header';

/**
 * Creates a basic page layout. Should wrap every page!
 */
const Layout = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <>
    <section className="container">
      <Header />
    </section>
    <section className="container">
      <main>{children}</main>
    </section>
    <section className="container">
      <Footer />
    </section>
  </>
);

export default Layout;
