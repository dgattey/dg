import { useEffect, useRef } from 'react';

type WaveformBounceOptions = {
  /**
   * Whether the animation is active
   */
  isPlaying: boolean;
  /**
   * Scale multiplier for the animation intensity (default: 1)
   */
  intensity?: number;
};

const SCROLL_RESUME_DELAY_MS = 120;

/**
 * Applies a compositor-driven beat bounce via the Web Animations API when music
 * is playing so Gecko/WebRender animates the transform on the compositor thread
 * without main-thread style invalidation or display-list rebuilds every frame.
 */
export function useWaveformBounce<T extends HTMLElement>({
  isPlaying,
  intensity = 1,
}: WaveformBounceOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    if (!isPlaying || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      element.style.transform = '';
      return;
    }
    if (typeof element.animate !== 'function') {
      return;
    }

    const clamped = Math.min(Math.max(intensity, 0.5), 1.6);
    const liftPx = -(1.8 * clamped).toFixed(2);
    const dipPx = (0.5 * clamped).toFixed(2);
    const tiltA = (1.1 * clamped).toFixed(2);
    const tiltB = (-0.9 * clamped).toFixed(2);

    const animation = element.animate(
      [
        { transform: 'rotate(0deg) translate3d(0, 0px, 0)' },
        { offset: 0.16, transform: `rotate(${tiltA}deg) translate3d(0, ${liftPx}px, 0)` },
        { offset: 0.42, transform: `rotate(-0.3deg) translate3d(0, ${dipPx}px, 0)` },
        { offset: 0.68, transform: `rotate(${tiltB}deg) translate3d(0, ${liftPx}px, 0)` },
        { transform: 'rotate(0deg) translate3d(0, 0px, 0)' },
      ],
      {
        duration: 1350,
        easing: 'ease-in-out',
        iterations: Number.POSITIVE_INFINITY,
      },
    );

    let scrollTimer: number | undefined;
    let pausedForScroll = false;
    const onScroll = () => {
      if (!pausedForScroll) {
        pausedForScroll = true;
        animation.pause();
      }
      if (scrollTimer !== undefined) {
        window.clearTimeout(scrollTimer);
      }
      scrollTimer = window.setTimeout(() => {
        pausedForScroll = false;
        animation.play();
      }, SCROLL_RESUME_DELAY_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer !== undefined) {
        window.clearTimeout(scrollTimer);
      }
      animation.cancel();
    };
  }, [isPlaying, intensity]);

  return ref;
}
