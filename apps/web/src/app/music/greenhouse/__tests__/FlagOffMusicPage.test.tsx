import type { ReactElement, ReactNode } from 'react';
import { PageTitle } from '../../../layouts/PageTitle';
import { FlagOffMusicPage } from '../../page';

jest.mock('../../../../services/music', () => ({
  getMusicHistory: jest.fn(),
}));

jest.mock('../../../greenhouse/GreenhouseSurface', () => ({
  GreenhouseSurface: ({ children }: { children: unknown }) => children,
}));

jest.mock('../../../layouts/greenhouseChrome', () => ({
  shouldUseGreenhouseChrome: () => Promise.resolve(false),
}));

describe('FlagOffMusicPage', () => {
  it('keeps the listening-history title in the flag-off tree', () => {
    const element = FlagOffMusicPage() as ReactElement<{ children: ReactNode }>;
    const children = Array.isArray(element.props.children)
      ? element.props.children
      : [element.props.children];
    const title = children.find(
      (child): child is ReactElement<{ children: string }> =>
        !!child && typeof child === 'object' && 'type' in child && child.type === PageTitle,
    );
    expect(title).toBeDefined();
    expect(title?.props.children).toBe('Listening history');
  });
});
