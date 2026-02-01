import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroCard } from '../IntroCard';

const mockUpdatePreferredMode = jest.fn();

jest.mock('@dg/ui/theme/useColorScheme', () => ({
  useColorScheme: () => ({
    colorScheme: {
      isCustomized: false,
      isInitialized: true,
      mode: 'light',
    },
    updatePreferredMode: mockUpdatePreferredMode,
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
    mockUpdatePreferredMode.mockClear();
  });

  it('renders the about text and allows theme selection', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IntroCard introBlock={introBlock} />
        <ColorSchemeToggleClient initialValue="system" />
      </>,
    );

    expect(screen.getByText('About me')).toBeInTheDocument();

    const themePicker = screen.getByRole('radiogroup', { name: 'Choose color scheme' });
    const radios = within(themePicker).getAllByRole('radio', { hidden: true });
    const darkRadio = radios.find(
      (radio) => radio instanceof HTMLInputElement && radio.value === 'dark',
    );

    if (!darkRadio) {
      throw new Error('Dark color option not found');
    }

    await user.click(darkRadio);
    expect(mockUpdatePreferredMode).toHaveBeenCalledWith('dark');
  });
});
