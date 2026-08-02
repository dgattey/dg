import type { ReactElement, ReactNode } from 'react';
import { PageTitle } from '../../../layouts/PageTitle';
import FavoriteAlbumsPage from '../page';

describe('Favorite albums page', () => {
  it('renders a page title without a sheet shell', () => {
    const element = FavoriteAlbumsPage() as ReactElement<{ children: ReactNode }>;
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
