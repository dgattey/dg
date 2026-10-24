import { PaperButton } from '../collage/PaperButton';
import type { PaperTone } from '../collage/types';
import { MUSIC_DESTINATIONS } from '../layouts/musicHeaderDestinations';

const NAV_PAPER = [
  { tiltDeg: -1.6, tone: 'ochre' },
  { tiltDeg: 1.5, tone: 'rose' },
] as const satisfies ReadonlyArray<{ tiltDeg: number; tone: PaperTone }>;

/** Paper buttons to the other two music pages, the same on each of the three. */
export function MusicNav({ current }: { current: string }) {
  return (
    <nav aria-label="Explore music" className="music__nav">
      {MUSIC_DESTINATIONS.filter((destination) => destination.href !== current).map(
        ({ href, icon: Icon, label }, i) => (
          <div className="collageLift" key={href}>
            <PaperButton href={href} title={label} {...NAV_PAPER[i % NAV_PAPER.length]}>
              <Icon aria-hidden={true} size={18} />
              {label}
            </PaperButton>
          </div>
        ),
      )}
    </nav>
  );
}
