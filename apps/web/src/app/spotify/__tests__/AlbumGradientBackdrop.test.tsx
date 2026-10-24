import { fireEvent, render } from '@testing-library/react';
import { AlbumGradientBackdrop } from '../AlbumGradientBackdrop';

const BLUE =
  'radial-gradient(circle at top right, hsla(210.0, 40.0%, 35.0%, 0.85) 0%, transparent)';
const ORANGE =
  'radial-gradient(circle at top right, hsla(20.0, 80.0%, 45.0%, 0.85) 0%, transparent)';

const layersIn = (container: HTMLElement) => [
  ...container.querySelectorAll('[data-gradient-layer]'),
];

describe('AlbumGradientBackdrop', () => {
  it('paints nothing until a gradient is known', () => {
    const { container } = render(<AlbumGradientBackdrop variant="surface" />);

    expect(layersIn(container)).toHaveLength(0);
  });

  it('keeps the outgoing gradient painted while the new one fades in', () => {
    const { container, rerender } = render(
      <AlbumGradientBackdrop gradient={BLUE} variant="surface" />,
    );
    const outgoing = layersIn(container)[0];

    rerender(<AlbumGradientBackdrop gradient={ORANGE} variant="surface" />);

    const layers = layersIn(container);
    expect(layers).toHaveLength(2);
    expect(layers[0]).toBe(outgoing);
  });

  it('drops the spent layer once the incoming one is fully opaque', () => {
    const { container, rerender } = render(
      <AlbumGradientBackdrop gradient={BLUE} variant="surface" />,
    );
    rerender(<AlbumGradientBackdrop gradient={ORANGE} variant="surface" />);
    const incoming = layersIn(container)[1];

    if (incoming) {
      fireEvent.animationEnd(incoming);
    }

    expect(layersIn(container)).toEqual([incoming]);
  });

  it('leaves the stack alone when an already-replaced layer finishes late', () => {
    const { container, rerender } = render(
      <AlbumGradientBackdrop gradient={BLUE} variant="surface" />,
    );
    rerender(<AlbumGradientBackdrop gradient={ORANGE} variant="surface" />);
    const outgoing = layersIn(container)[0];

    if (outgoing) {
      fireEvent.animationEnd(outgoing);
    }

    expect(layersIn(container)).toHaveLength(2);
  });

  it('reuses the same layer when the gradient is unchanged', () => {
    const { container, rerender } = render(
      <AlbumGradientBackdrop gradient={BLUE} variant="surface" />,
    );
    const original = layersIn(container)[0];

    rerender(<AlbumGradientBackdrop gradient={BLUE} variant="surface" />);

    expect(layersIn(container)).toEqual([original]);
  });

  it('clears every layer when the gradient goes away', () => {
    const { container, rerender } = render(
      <AlbumGradientBackdrop gradient={BLUE} variant="surface" />,
    );

    rerender(<AlbumGradientBackdrop variant="surface" />);

    expect(layersIn(container)).toHaveLength(0);
  });
});
