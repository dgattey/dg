import type { EndpointKey } from 'api/endpoints';
import ColorSchemeContext from 'components/ColorSchemeContext';
import Footer from 'components/Footer';
import Header from 'components/Header';
import Meta from 'components/Meta';
import ScrollIndicatorContext from 'components/ScrollIndicatorContext';
import useColorScheme from 'hooks/useColorScheme';
import useShowScrollIndicator from 'hooks/useShowScrollIndicator';
import type { Page } from 'types/Page';
import { useRef } from 'react';
import { SWRConfig } from 'swr';

/**
 * We have props that dictate a fallback for SWRConfig, plus children
 */
type Props<Key extends EndpointKey> = Pick<React.ComponentProps<'div'>, 'children'> & Page<Key>;

/**
 * Basic page layout for every page. Has a sticky, contained header above
 * the main (contained) content, with a (contained) footer below. No wrapper
 * around all items to save on divs. Ensures color scheme is applied.
 */
function PageLayout<Key extends EndpointKey>({ children, fallback, pageUrl }: Props<Key>) {
  const colorSchemeData = useColorScheme();
  const headerSizingRef = useRef<HTMLDivElement>(null);
  const { ref, isIndicatorShown } = useShowScrollIndicator(
    headerSizingRef.current?.getBoundingClientRect().height ?? 0,
  );
  return (
    <SWRConfig value={{ fallback }}>
      <Meta pageUrl={pageUrl} />
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
}

export default PageLayout;
