import { act, render } from '@testing-library/react';
import { MusicNotes } from '../MusicNotes';

describe('MusicNotes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stays idle when playback is off', () => {
    const { container } = render(<MusicNotes isPlaying={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps the default drop shadow for flag-off album art', () => {
    const { container } = render(<MusicNotes isPlaying={true} noteColor="#fff" />);
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(container.querySelector('[data-music-notes="default"]')).toBeTruthy();
    const note = container.querySelector('[data-music-notes="default"] > div');
    expect(note).toHaveStyle({
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
    });
  });

  it('uses the lighter card shadow and wider scatter variant', () => {
    const { container } = render(
      <MusicNotes isPlaying={true} noteColor="#fff8e6" variant="card" />,
    );
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(container.querySelector('[data-music-notes="card"]')).toBeTruthy();
    const note = container.querySelector('[data-music-notes="card"] > div');
    expect(note).toHaveStyle({
      filter: 'drop-shadow(0 1px 2px rgba(64, 48, 12, 0.22))',
    });
  });
});
