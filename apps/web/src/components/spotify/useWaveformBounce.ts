import { useCallback, useEffect, useRef } from 'react';

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

/**
 * Hook that applies a waveform-simulated bounce animation to a ref.
 * Creates organic, music-like movement with randomness.
 */
export function useWaveformBounce<T extends HTMLElement>({
  isPlaying,
  intensity = 1,
}: WaveformBounceOptions) {
  const ref = useRef<T>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const time = timeRef.current;
    const scale = intensity;

    // Base pulse - breathing effect
    const basePulse = Math.sin(time * 0.9) * 0.011 * scale;

    // Secondary rhythm - groove oscillation
    const rhythm = Math.sin(time * 1.5) * 0.006 * scale;

    // Micro-movement for life
    const jitter = (Math.random() - 0.5) * 0.003 * scale;

    // Beat response - snappy but not harsh
    const beatPhase = Math.sin(time * 0.55);
    const beat = beatPhase > 0.88 ? 0.015 * ((beatPhase - 0.88) * 8.3) ** 1.3 * scale : 0;

    // Vertical movement synced with scale
    const yOffset = (basePulse + rhythm + beat * 0.6) * -14;

    // Combine into final transform
    const finalScale = 1 + basePulse + rhythm + jitter + beat;

    ref.current.style.transform = `scale3d(${finalScale}, ${finalScale}, 1) translate3d(0, ${yOffset}px, 0)`;

    // Advance time
    timeRef.current += 0.07;

    rafRef.current = requestAnimationFrame(animate);
  }, [intensity]);

  useEffect(() => {
    if (isPlaying) {
      timeRef.current = 0;
      animate();
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (ref.current) {
        ref.current.style.transform = 'scale3d(1, 1, 1) translate3d(0, 0, 0)';
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, animate]);

  return ref;
}
