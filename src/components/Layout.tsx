import styled from 'styled-components';
import Footer from './Footer';
import Header from './Header';

const HeaderBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
`;

/**
 * Creates a basic page layout. Should wrap every page!
 */
const Layout = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <>
    <HeaderBar>
      <section className="container">
        <Header />
      </section>
    </HeaderBar>
    <section className="container">
      <main>{children}</main>
    </section>
    <section className="container">
      <Footer />
    </section>
  </>
);

export default Layout;
