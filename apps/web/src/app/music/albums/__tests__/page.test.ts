import { homeRoute } from '@dg/shared-core/routes/app';
import type { ReactElement } from 'react';

jest.mock('@dg/ui/core/sheet/Sheet', () => ({
  Sheet: Object.assign(({ children }: { children: React.ReactNode }) => children, {
    displayName: 'Sheet',
  }),
}));

import { Sheet } from '@dg/ui/core/sheet/Sheet';
import FavoriteAlbumsPage from '../page';

describe('Favorite albums page', () => {
  it('wraps content in a home-closing sheet without awaiting at the page root', () => {
    const element = FavoriteAlbumsPage() as ReactElement<{
      closeHref: string;
      title: string;
    }>;
    expect(element.type).toBe(Sheet);
    expect(element.props.title).toBe('Favorite albums');
    expect(element.props.closeHref).toBe(homeRoute);
  });
});
