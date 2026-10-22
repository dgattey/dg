import { render, screen } from '@testing-library/react';
import { SocialCard } from '../SocialCard';

const GRAIN =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII=';

describe('SocialCard', () => {
  it('renders the homepage social card with portrait and live bio excerpt', () => {
    render(
      <SocialCard
        grainUrl={GRAIN}
        headline="Hey friends!"
        name="Dylan Gattey"
        portraitUrl="https://images.ctfassets.net/dylan.jpg"
        tagline="I'm Dylan, a SF-based engineering leader & serial builder."
      />,
    );

    expect(screen.getByText('Hey')).toBeInTheDocument();
    expect(screen.getByText('friends!')).toBeInTheDocument();
    expect(screen.getByText('Dylan Gattey')).toBeInTheDocument();
    expect(
      screen.getByText("I'm Dylan, a SF-based engineering leader & serial builder."),
    ).toBeInTheDocument();
  });

  it('renders the listening stats social card for the selected year', () => {
    render(
      <SocialCard
        activeDaysPercent="74%"
        activeDaysSub="218 of 295d"
        activeMonths={10}
        grainUrl={GRAIN}
        listeningHours="541h"
        playsCompact="8,526"
        playsFull="8,526"
        topAlbums={[
          {
            artistNames: 'ROSALÍA',
            imageUrl: null,
            name: 'LUX (Complete Works)',
            plays: '412',
          },
        ]}
        topArtists={[{ months: 10, name: 'ROSALÍA', plays: '612' }]}
        tracksAndArtistsSub="2,418 tracks · 912 artists"
        variant="music-stats"
        year={2026}
        years={[
          { plays: 23510, year: 2025 },
          { plays: 8526, year: 2026 },
        ]}
      />,
    );

    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('stats')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Plays in 2026')).toBeInTheDocument();
    expect(screen.getByText('8,526')).toBeInTheDocument();
    expect(screen.getByText('541h')).toBeInTheDocument();
    expect(screen.getByText('#1 ALBUM IN 2026')).toBeInTheDocument();
    expect(screen.getByText('LUX (Complete Works)')).toBeInTheDocument();
    expect(screen.getByText('TOP ARTISTS · 2026')).toBeInTheDocument();
  });

  it('renders the listening history social card with a single recent plays pill', () => {
    render(
      <SocialCard
        grainUrl={GRAIN}
        latestSummary="Mat Kearney · John Summit"
        recentAlbums={[
          {
            albumName: 'Mat Kearney',
            artistNames: 'Mat Kearney',
            imageUrl: 'https://i.scdn.co/image/mk.jpg',
            trackCount: 11,
          },
        ]}
        totalRecentTracks={25}
        variant="music-history"
      />,
    );

    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('history')).toBeInTheDocument();
    expect(screen.getByText('25 recent plays')).toBeInTheDocument();
    expect(screen.queryByText('Today & recent')).not.toBeInTheDocument();
    expect(screen.getByText('11 plays')).toBeInTheDocument();
    expect(screen.getByText('Mat Kearney · John Summit')).toBeInTheDocument();
  });

  it('renders the favorite albums social card without numbering albums', () => {
    render(
      <SocialCard
        albums={[
          {
            artistNames: 'Miami Horror',
            imageUrl: 'https://i.scdn.co/image/mh.jpg',
            name: 'We Always Had Tomorrow',
            releaseYear: '2025',
          },
        ]}
        grainUrl={GRAIN}
        totalCount={104}
        variant="favorite-albums"
      />,
    );

    expect(screen.getByText('Favorite')).toBeInTheDocument();
    expect(screen.getByText('albums')).toBeInTheDocument();
    expect(screen.getByText('We Always Had Tomorrow')).toBeInTheDocument();
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.getByText('104')).toBeInTheDocument();
  });

  it('renders the reading social card with the favorites pill and viridian hero card', () => {
    render(
      <SocialCard
        featured={{
          author: 'Oprah Winfrey',
          coverUrl: null,
          rating: 4,
          review: 'A profound statement of compassion and positivity.',
          tag: 'Latest review',
          title: 'The Path Made Clear',
          year: '2026',
        }}
        fiveStarCount={54}
        grainUrl={GRAIN}
        picks={[
          {
            author: 'Frank Herbert',
            coverUrl: null,
            rating: 5,
            review: 'Wow, what an epic.',
            title: 'Dune',
            year: '2025',
          },
        ]}
        totalBooks={152}
        variant="reading"
      />,
    );

    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText("I've read")).toBeInTheDocument();
    expect(screen.getByText('152 books · 54 favorites')).toBeInTheDocument();
    expect(screen.getByText('Latest review')).toBeInTheDocument();
    expect(screen.getByText(/Wow, what an epic/)).toBeInTheDocument();
  });

  it('renders the Strava social card with single-line Big map, recent stat, and routes pill', () => {
    render(
      <SocialCard
        feetClimbed="1.64M"
        firstYear={2016}
        grainUrl={GRAIN}
        landPaths={['M0 0 L10 10 Z']}
        latestKicker="LATEST RIDE · OCT 20, 2026"
        latestTitle="Going maximalist"
        miles="27,657"
        outings="1,857"
        recentStat="Latest: 19.2 mi · 1,086 ft"
        routeCountLabel="1,079 routes"
        routePaths={[{ d: 'M10 10l50 50', tone: 'cobalt' }]}
        variant="strava"
      />,
    );

    expect(screen.getByText('Big map')).toBeInTheDocument();
    expect(screen.getByText('Latest: 19.2 mi · 1,086 ft')).toBeInTheDocument();
    expect(screen.getByText('1,079 routes')).toBeInTheDocument();
    expect(screen.getByText('27,657')).toBeInTheDocument();
    expect(screen.getByText('1.64M')).toBeInTheDocument();
    expect(screen.getByText('1,857')).toBeInTheDocument();
  });
});
