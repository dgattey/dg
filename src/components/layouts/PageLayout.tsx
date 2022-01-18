import Footer from 'components/Footer';
import Header from 'components/Header';
import ScrollIndicatorContext from 'components/ScrollIndicatorContext';
import useShowScrollIndicator from 'hooks/useShowScrollIndicator';
import { useRef } from 'react';

/**
 * Basic page layout for every page. Has a sticky, contained header above
 * the main (contained) content, with a (contained) footer below. No wrapper
 * around all items to save on divs.
 */
const PageLayout = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => {
  const headerSizingRef = useRef<HTMLDivElement>(null);
  const { ref, isIndicatorShown } = useShowScrollIndicator(
    headerSizingRef.current?.getBoundingClientRect().height ?? 0,
  );
  return (
    <ScrollIndicatorContext.Provider value={isIndicatorShown}>
      <Header headerRef={headerSizingRef} />
      <section className="container">
        <div ref={ref} style={{ height: 0, width: 0 }} />
        <main>{children}</main>
      </section>
      <Footer />
    </ScrollIndicatorContext.Provider>
  );
};

export default PageLayout;
