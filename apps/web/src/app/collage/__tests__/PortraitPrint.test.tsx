import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import { render, screen } from '@testing-library/react';
import { PortraitPrint } from '../PortraitPrint';

jest.mock('@dg/ui/dependent/Image', () => ({
  // biome-ignore lint/performance/noImgElement: test double for the portrait
  Image: ({ alt, url }: { alt: string; url: string }) => <img alt={alt} src={url} />,
}));

const image: RenderableAsset = {
  height: 800,
  title: 'Drew',
  url: 'https://images.example/portrait.jpg',
  width: 600,
};

describe('PortraitPrint', () => {
  it('links the portrait and About tag and leaves the flora outside the link', () => {
    const { container } = render(
      <PortraitPrint
        image={image}
        linkedInLink={{ title: 'LinkedIn', url: 'https://linkedin.com/in/x' }}
      />,
    );

    const link = screen.getByRole('link', { name: 'About on LinkedIn' });
    const portrait = screen.getByRole('img', { name: 'Drew' });

    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/x');
    expect(link).toContainElement(portrait);
    expect(portrait).toHaveAttribute('src', 'https://images.example/portrait.jpg');
    expect(link).toHaveTextContent('AboutLinkedIn');
    expect(link.querySelector('.cutOut')).toBeNull();
    expect(
      [...container.querySelectorAll('.cutOut')].map((element) =>
        element.getAttribute('data-cut-out'),
      ),
    ).toEqual(['portrait-monstera', 'portrait-philo']);
  });

  it('renders the portrait and About tag with no link when linkedInLink is null', () => {
    const { container } = render(<PortraitPrint image={image} linkedInLink={null} />);

    expect(screen.queryByRole('link', { name: 'About on LinkedIn' })).toBeNull();
    expect(screen.getByRole('img', { name: 'Drew' })).toHaveAttribute(
      'src',
      'https://images.example/portrait.jpg',
    );
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('.cutOut')].map((element) =>
        element.getAttribute('data-cut-out'),
      ),
    ).toEqual(['portrait-monstera', 'portrait-philo']);
  });
});
