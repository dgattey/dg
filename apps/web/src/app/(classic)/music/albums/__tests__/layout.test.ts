import { Children, isValidElement } from 'react';
import { CutLetters } from '../../../../collage/CutLetters';
import { PageTitle } from '../../../../layouts/PageTitle';
import FavoriteAlbumsLayout from '../layout';

jest.mock('../../../../../services/albums', () => ({
  getFavoriteAlbums: jest.fn(),
}));

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

  it('renders the collage title through CutLetters', () => {
    const element = FavoriteAlbumsLayout({ children: null, surface: 'collage' });
    const title = Children.toArray(element.props.children).find(
      (child) => isValidElement(child) && child.type === CutLetters,
    );

    expect(element.type).toBe('section');
    expect(isValidElement<{ text: string }>(title) ? title.props.text : undefined).toBe(
      'Favorite albums',
    );
  });
});
