import { Children, isValidElement } from 'react';
import { CutLetters } from '../../../collage/CutLetters';
import FavoriteAlbumsLayout from '../layout';

describe('Favorite albums layout', () => {
  it('renders the page title so it survives album navigations', () => {
    const element = FavoriteAlbumsLayout({ children: null });
    const title = Children.toArray(element.props.children).find(
      (child) => isValidElement(child) && child.type === CutLetters,
    );
    expect(title).toBeDefined();
    expect(isValidElement<{ text: string }>(title) ? title.props.text : undefined).toBe(
      'Favorite albums',
    );
  });
});
