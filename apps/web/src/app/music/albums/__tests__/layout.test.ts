import type { ReactElement, ReactNode } from 'react';
import { Suspense } from 'react';
import { PageTitle } from '../../../layouts/PageTitle';
import { FlagOffAlbumsLayout } from '../FlagOffAlbumsLayout';
import FavoriteAlbumsLayout from '../layout';

describe('Favorite albums layout', () => {
  it('keeps flag evaluation behind Suspense so the route can prerender', () => {
    const element = FavoriteAlbumsLayout({ children: null });
    expect(element.type).toBe(Suspense);
  });

  it('renders the page title so it survives album navigations', () => {
    const element = FlagOffAlbumsLayout({ children: null }) as ReactElement<{
      children: ReactNode;
    }>;
    const children = Array.isArray(element.props.children)
      ? element.props.children
      : [element.props.children];
    const title = children.find(
      (child): child is ReactElement<{ children: string }> =>
        !!child && typeof child === 'object' && 'type' in child && child.type === PageTitle,
    );
    expect(title).toBeDefined();
    expect(title?.props.children).toBe('Favorite albums');
  });
});
