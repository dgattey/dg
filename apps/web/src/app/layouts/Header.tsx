import { getHeaderContent } from '../../services/contentful';
import { getLastKnownSong } from '../../services/spotify';
import { CollageColorSchemeToggle } from '../collage/CollageColorSchemeToggle';
import { SpotifyHeaderCard } from '../spotify/SpotifyHeaderCard';
import { CollageMusicLinks } from './CollageMusicLinks';
import { Logo } from './Logo';
import { SiteHeaderHeight } from './SiteHeaderHeight';

async function LastKnownSpotifyHeaderCard() {
  return <SpotifyHeaderCard track={await getLastKnownSong()} />;
}

export async function Header() {
  const { items } = await getHeaderContent();

  return (
    <>
      <SiteHeaderHeight />
      <header className="collageMeasure chrome__header" data-sticky-header={true}>
        <Logo />
        <div className="chrome__nowPlaying collageLift">
          <LastKnownSpotifyHeaderCard />
        </div>
        <div className="chrome__spacer" />
        <nav className="chrome__nav">
          <div className="chrome__strip collageLift">
            <CollageMusicLinks items={items} />
            <CollageColorSchemeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}
