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

  it('uses the compact size for tight contexts', () => {
    const { container } = render(
      <MusicNotes isPlaying={true} noteColor="#fff" variant="compact" />,
    );
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(container.querySelector('[data-music-notes="compact"]')).toBeTruthy();
  });
});
