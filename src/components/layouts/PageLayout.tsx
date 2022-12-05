import type { EndpointKey } from 'api/endpoints';
import { FetchedFallbackData } from 'api/fetchFallbackData';
import { ColorSchemeContext } from 'components/ColorSchemeContext';
import { Footer } from 'components/Footer';
import { Header } from 'components/Header';
import { Meta } from 'components/Meta';
import { ScrollIndicatorContext } from 'components/ScrollIndicatorContext';
import { useColorScheme } from 'hooks/useColorScheme';
import { useShowScrollIndicator } from 'hooks/useShowScrollIndicator';
import { useRef } from 'react';
import { SWRConfig } from 'swr';

/**
 * We have props that dictate a fallback for SWRConfig, plus children
 */
type PageLayoutProps<Keys extends EndpointKey> = {
  children: React.ReactNode;
  pageUrl: string;

  /**
   * Provides SWR with fallback version/header/footer data
   */
  fallback: FetchedFallbackData<Keys>;
};

/**
 * Basic page layout for every page. Has a sticky, contained header above
 * the main (contained) content, with a (contained) footer below. No wrapper
 * around all items to save on divs. Ensures color scheme is applied.
 */
export function PageLayout<Key extends EndpointKey>({
  children,
  fallback,
  pageUrl,
}: PageLayoutProps<Key>) {
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
