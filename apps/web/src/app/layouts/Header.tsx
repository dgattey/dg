import { connection } from 'next/server';
import { Suspense } from 'react';
import { getLastKnownSong, getLatestSong } from '../../services/spotify';
import { CollageColorSchemeFieldset } from '../collage/CollageColorSchemeFieldset';
import { PublishNowPlaying } from '../spotify/NowPlayingContext';
import { SpotifyHeaderCard } from '../spotify/SpotifyHeaderCard';
import { CollageMusicLinks } from './CollageMusicLinks';
import { Logo } from './Logo';
import { SiteHeaderHeight } from './SiteHeaderHeight';

async function LastKnownSpotifyHeaderCard() {
  return <SpotifyHeaderCard track={await getLastKnownSong()} />;
}

async function LiveNowPlaying() {
  await connection();
  const track = await getLatestSong();
  return track ? <PublishNowPlaying track={track} /> : null;
}

export function Header() {
  return (
    <>
      <SiteHeaderHeight />
      <header className="collageMeasure chrome__header" data-sticky-header={true}>
        <Logo />
        <div className="chrome__nowPlaying collageLift">
          <LastKnownSpotifyHeaderCard />
          <Suspense fallback={null}>
            <LiveNowPlaying />
          </Suspense>
        </div>
        <div className="chrome__spacer" />
        <nav className="chrome__nav">
          <CollageMusicLinks />
          <CollageColorSchemeFieldset />
        </nav>
      </header>
    </>
  );
}
