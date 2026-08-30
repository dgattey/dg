import { Children, isValidElement } from 'react';
import { PageTitle } from '../../../../layouts/PageTitle';
import FavoriteAlbumsLayout from '../layout';

describe('Favorite albums layout', () => {
  it('renders the page title so it survives album navigations', () => {
    const element = FavoriteAlbumsLayout({ children: null });
    const title = Children.toArray(element.props.children).find(
      (child) => isValidElement(child) && child.type === PageTitle,
    );
    expect(title).toBeDefined();
    expect(isValidElement<{ children: string }>(title) ? title.props.children : undefined).toBe(
      'Favorite albums',
    );
  });
});
