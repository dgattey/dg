import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import { render, screen } from '@testing-library/react';
import { PortraitPrint } from '../PortraitPrint';

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
    expect(portrait).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(image.url)));
    expect(link).toHaveTextContent('AboutDylan');
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
      expect.stringContaining(encodeURIComponent(image.url)),
    );
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Dylan')).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('.cutOut')].map((element) =>
        element.getAttribute('data-cut-out'),
      ),
    ).toEqual(['portrait-monstera', 'portrait-philo']);
  });

  /**
   * The window is taller than wide, so a square photo covers it at the window's
   * height. Asking for just the frame width would fetch too few pixels.
   */
  it('sizes the photo for how wide it renders when covering the window', () => {
    render(<PortraitPrint image={{ ...image, height: 800, width: 800 }} linkedInLink={null} />);

    expect(screen.getByRole('img', { name: 'Drew' })).toHaveAttribute(
      'sizes',
      '(max-width: 576px) 395px, (max-width: 768px) 395px, (max-width: 992px) 516px, (max-width: 1200px) 516px, 516px',
    );
  });
});
