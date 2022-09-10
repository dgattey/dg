import type { EndpointKey } from '@dg/api/endpoints';
import ColorSchemeContext from '@dg/components/ColorSchemeContext';
import Footer from '@dg/components/Footer';
import Header from '@dg/components/Header';
import Meta from '@dg/components/Meta';
import ScrollIndicatorContext from '@dg/components/ScrollIndicatorContext';
import useColorScheme from '@dg/hooks/useColorScheme';
import useShowScrollIndicator from '@dg/hooks/useShowScrollIndicator';
import type { Page } from '@dg/types/Page';
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
const PageLayout = <Key extends EndpointKey>({ children, fallback, pageUrl }: Props<Key>) => {
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
};

export default PageLayout;
