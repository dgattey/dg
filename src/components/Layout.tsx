import styled from 'styled-components';
import Footer from './Footer';
import Header from './Header';

// Makes the header bar sticky and not responsive to user events by default
const HeaderBar = styled.div`
  position: sticky;
  top: -1em;
  z-index: 1;
  pointer-events: none;
`;

/**
 * Basic page layout for every page. Has a sticky, contained header above
 * the main (contained) content, with a (contained) footer below. No wrapper
 * around all items to save on divs.
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
