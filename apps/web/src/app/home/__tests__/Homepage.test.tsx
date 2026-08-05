import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        <ColorSchemeToggleClient />
      </>,
    );

    expect(screen.getByText('About me')).toBeInTheDocument();

    // The picker is collapsed until its trigger is pressed
    await user.click(screen.getByRole('button', { name: 'Color scheme: system' }));

    const themePicker = screen.getByRole('radiogroup', {
      name: 'Choose color scheme',
    });
    await user.click(within(themePicker).getByRole('radio', { name: 'Dark' }));

    expect(mockSetPreference).toHaveBeenCalledWith('dark');
  });
});
