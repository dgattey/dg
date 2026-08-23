import { Suspense } from 'react';
import MusicPage from '../page';

describe('Music page', () => {
  it('keeps flag evaluation behind Suspense so the route can prerender', () => {
    const element = MusicPage();
    expect(element.type).toBe(Suspense);
  });
});
