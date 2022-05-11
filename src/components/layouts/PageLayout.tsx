import type { EndpointKey } from 'api/endpoints';
import type { PartialFallback } from 'api/fetchFallback';
import ColorSchemeContext from 'components/ColorSchemeContext';
import Footer from 'components/Footer';
import Header from 'components/Header';
import Meta from 'components/Meta';
import ScrollIndicatorContext from 'components/ScrollIndicatorContext';
import useColorScheme from 'hooks/useColorScheme';
import useShowScrollIndicator from 'hooks/useShowScrollIndicator';
import { useRef } from 'react';
import { SWRConfig } from 'swr';

/**
 * We have props that dictate a fallback for SWRConfig, plus children
 */
type Props<Key extends EndpointKey> = Pick<React.ComponentProps<'div'>, 'children'> & {
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
 * around all items to save on divs. Ensures color scheme is applied.
 */
const PageLayout = <Key extends EndpointKey>({ children, fallback }: Props<Key>) => {
  const colorSchemeData = useColorScheme();
  const headerSizingRef = useRef<HTMLDivElement>(null);
  const { ref, isIndicatorShown } = useShowScrollIndicator(
    headerSizingRef.current?.getBoundingClientRect().height ?? 0,
  );
  return (
    <SWRConfig value={{ fallback }}>
      <Meta />
      <ColorSchemeContext.Provider value={colorSchemeData}>
        <ScrollIndicatorContext.Provider value={isIndicatorShown}>
          <Header headerRef={headerSizingRef} />
          <section className="container">
            <div ref={ref} style={{ height: 0, width: 0 }} />
            <main>{children}</main>
          </section>
          <Footer />
        </ScrollIndicatorContext.Provider>
      </ColorSchemeContext.Provider>
    </SWRConfig>
  );
};

export default PageLayout;
