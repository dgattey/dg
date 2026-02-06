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

/** Skip DOM transform update when change is below these (reduces redundant style/layout work). */
const THRESHOLD_SCALE = 0.00015;
const THRESHOLD_Y_PX = 0.025;
const THRESHOLD_ROT_DEG = 0.03;

/**
 * Hook that applies a beat-led bounce to a ref when music is playing.
 * Clear rhythmic pulses with subtle organic variation between beats.
 * requestAnimationFrame already caps at display refresh rate; we only write
 * the transform when the change is significant to avoid constant tiny updates.
 */
export function useWaveformBounce<T extends HTMLElement>({
  isPlaying,
  intensity = 1,
}: WaveformBounceOptions) {
  const ref = useRef<T>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const jitterRef = useRef(0);
  const rotationRef = useRef(0);
  const nudgedThisBeatRef = useRef(false);
  const lastScaleRef = useRef(1);
  const lastYRef = useRef(0);
  const lastRotRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (ref.current) {
        ref.current.style.transform = 'rotate(0deg) scale3d(1, 1, 1) translate3d(0, 0, 0)';
      }
      return;
    }

    timeRef.current = 0;
    jitterRef.current = 0;
    rotationRef.current = 0;
    nudgedThisBeatRef.current = false;
    lastScaleRef.current = 1;
    lastYRef.current = 0;
    lastRotRef.current = 0;

    const animate = () => {
      if (!ref.current) {
        return;
      }

      const time = timeRef.current;
      const scale = intensity;

      // Primary: clear beat pulse (snappy bump on each "downbeat") – exaggerated up
      const beatPhase = Math.sin(time * 0.6);
      const beat = beatPhase > 0.88 ? 0.026 * ((beatPhase - 0.88) * 8.3) ** 1.3 * scale : 0;

      // Sub-beats: layered breath (different frequencies so no fixed 2-beat cycle) + drift
      const breath1 = Math.sin(time * 0.35 + 0.5) * 0.005 * scale;
      const breath2 = Math.sin(time * 0.27 + 1.1) * 0.004 * scale;
      jitterRef.current = jitterRef.current * 0.86 + (Math.random() - 0.5) * 0.0035 * scale;
      const variation = breath1 + breath2 + jitterRef.current;

      const scaleDelta = (beat + variation) * 0.95;
      // Vertical bounce: lift on beat + breath wobble, in px (negative = up)
      const yOffset = (beat * 0.8 + variation * 1.3) * -14;

      if (beatPhase > 0.88) {
        if (!nudgedThisBeatRef.current) {
          nudgedThisBeatRef.current = true;
          const nudgeMag = 0.4 + Math.random() * 1.8;
          rotationRef.current += (Math.random() - 0.5) * 2 * nudgeMag * 0.9;
        }
        rotationRef.current += beat * 10.8 * (Math.random() - 0.5) * scale;
      } else if (beatPhase < 0.5) {
        nudgedThisBeatRef.current = false;
      }
      rotationRef.current *= 0.96 + Math.random() * 0.025;
      const finalScale = 1 + scaleDelta;
      const rotDeg = rotationRef.current;

      const scaleChanged = Math.abs(finalScale - lastScaleRef.current) >= THRESHOLD_SCALE;
      const yChanged = Math.abs(yOffset - lastYRef.current) >= THRESHOLD_Y_PX;
      const rotChanged = Math.abs(rotDeg - lastRotRef.current) >= THRESHOLD_ROT_DEG;
      if (scaleChanged || yChanged || rotChanged) {
        lastScaleRef.current = finalScale;
        lastYRef.current = yOffset;
        lastRotRef.current = rotDeg;
        ref.current.style.transform = `rotate(${rotDeg}deg) scale3d(${finalScale}, ${finalScale}, 1) translate3d(0, ${yOffset}px, 0)`;
      }

      timeRef.current += 0.16;

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, intensity]);

  return ref;
}
