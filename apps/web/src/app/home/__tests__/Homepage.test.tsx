import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollageColorSchemeFieldset } from '../../collage/CollageColorSchemeFieldset';
import { IntroCard } from '../IntroCard';

const mockSetPreference = jest.fn();

jest.mock('@dg/ui/theme/useColorScheme', () => ({
  useColorScheme: () => ({
    preference: 'system',
    setPreference: mockSetPreference,
  }),
}));

const introBlock: IntroContent = {
  image: {
    height: 660,
    title: 'Intro image',
    url: 'https://example.com/intro.webp',
    width: 660,
  },
  textBlock: {
    content: {
      json: {
        content: [
          {
            content: [
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: 'About me',
              },
            ],
            data: {},
            nodeType: 'paragraph',
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: {
        assets: {
          block: [],
        },
        entries: {
          block: [],
          inline: [],
        },
      },
    },
  },
};

describe('Homepage basics', () => {
  beforeEach(() => {
    mockSetPreference.mockClear();
  });

  it('renders the about text and allows theme selection', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IntroCard introBlock={introBlock} linkedInLink={null} />
        <CollageColorSchemeFieldset />
      </>,
    );

    expect(screen.getByText('About me')).toBeInTheDocument();

    const schemeGroup = screen.getByRole('group', { name: 'Color scheme' });
    await user.click(within(schemeGroup).getByRole('radio', { name: 'Dark' }));

    expect(mockSetPreference).toHaveBeenCalledWith('dark');
  });
});
