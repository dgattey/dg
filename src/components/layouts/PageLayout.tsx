import { FetcherKey, PartialFallback } from 'api/useData';
import Footer from 'components/Footer';
import Header from 'components/Header';
import ScrollIndicatorContext from 'components/ScrollIndicatorContext';
import useShowScrollIndicator from 'hooks/useShowScrollIndicator';
import { useRef } from 'react';
import { SWRConfig } from 'swr';

/**
 * We have props that dictate a fallback for SWRConfig, plus children
 */
type Props<Key extends FetcherKey> = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * Fallback data to show, meaning the page must fetch this data in
   * `getStaticProps` and pass it here using props on the page
   * component itself.
   */
  fallback: PartialFallback<Key>;
};

/**
 * Basic page layout for every page. Has a sticky, contained header above
 * the main (contained) content, with a (contained) footer below. No wrapper
 * around all items to save on divs.
 */
const PageLayout = <Key extends FetcherKey>({ children, fallback }: Props<Key>) => {
  const headerSizingRef = useRef<HTMLDivElement>(null);
  const { ref, isIndicatorShown } = useShowScrollIndicator(
    headerSizingRef.current?.getBoundingClientRect().height ?? 0,
  );
  return (
    <SWRConfig value={{ fallback }}>
      <ScrollIndicatorContext.Provider value={isIndicatorShown}>
        <Header headerRef={headerSizingRef} />
        <section className="container">
          <div ref={ref} style={{ height: 0, width: 0 }} />
          <main>{children}</main>
        </section>
        <Footer />
      </ScrollIndicatorContext.Provider>
    </SWRConfig>
  );
};

export default PageLayout;
