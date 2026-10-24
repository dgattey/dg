import { isValidElement } from 'react';
import FavoriteAlbumsPage from '../albums/page';
import { MusicPageShell } from '../MusicPageShell';
import MusicPage from '../page';
import MusicStatsPage from '../stats/page';

describe('music routes', () => {
  it.each([
    ['/music', () => MusicPage(), 'Listening history'],
    ['/music/albums', () => FavoriteAlbumsPage(), 'Favorite albums'],
    ['/music/stats', () => MusicStatsPage(), 'Listening stats'],
  ])('frames %s synchronously so its title can morph', (_route, renderRoute, title) => {
    const element = renderRoute();

    expect(isValidElement(element) && element.type === MusicPageShell).toBe(true);
    expect(isValidElement<{ title: string }>(element) ? element.props.title : null).toBe(title);
  });
});
