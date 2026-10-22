import { render, screen } from '@testing-library/react';
import { SocialCard } from '../SocialCard';

const GRAIN =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII=';

describe('SocialCard', () => {
  it('renders the homepage social card with portrait and tagline', () => {
    render(
      <SocialCard
        grainUrl={GRAIN}
        headline="Hey friends!"
        name="Dylan Gattey"
        portraitUrl="https://images.ctfassets.net/dylan.jpg"
        tagline="Engineer. Problem Solver."
      />,
    );

    expect(screen.getByText('Hey')).toBeInTheDocument();
    expect(screen.getByText('friends!')).toBeInTheDocument();
    expect(screen.getByText('Dylan Gattey')).toBeInTheDocument();
    expect(screen.getByText('Engineer. Problem Solver.')).toBeInTheDocument();
  });

  it('renders the listening stats social card with totals, top album, and yearly chart', () => {
    render(
      <SocialCard
        activeDaysPercent="82%"
        activeDaysSub="4,562 of 5,566d"
        grainUrl={GRAIN}
        listeningHours="20,111h"
        monthStreak={177}
        playsCompact="316k+"
        playsFull="316,332"
        topAlbums={[
          { artistNames: 'ODESZA', imageUrl: null, name: 'A Moment Apart', plays: '1,966' },
        ]}
        topArtists={[{ months: 71, name: 'Burna Boy', plays: '6,673' }]}
        tracksAndArtistsSub="61,441 tracks · 18,306 artists"
        variant="music-stats"
        years={[
          { plays: 21273, year: 2012 },
          { plays: 32979, year: 2022 },
        ]}
      />,
    );

    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('stats')).toBeInTheDocument();
    expect(screen.getByText('316k+')).toBeInTheDocument();
    expect(screen.getByText('20,111h')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('A Moment Apart')).toBeInTheDocument();
    expect(screen.getByText(/Burna Boy/)).toBeInTheDocument();
  });

  it('renders the listening history social card with fanned album sleeves and play counts', () => {
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
        recentLabel="Today & recent"
        totalRecentTracks={24}
        variant="music-history"
      />,
    );

    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('history')).toBeInTheDocument();
    expect(screen.getByText('11 plays')).toBeInTheDocument();
    expect(screen.getByText('Mat Kearney · John Summit')).toBeInTheDocument();
  });

  it('renders the favorite albums social card with rank stamps', () => {
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
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('104')).toBeInTheDocument();
  });

  it('renders the reading social card with the viridian hero card and five-star picks', () => {
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
        fiveStarCount={39}
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
        totalBooks={151}
        variant="reading"
      />,
    );

    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText("I've read")).toBeInTheDocument();
    expect(screen.getByText('Latest review')).toBeInTheDocument();
    expect(screen.getByText(/Wow, what an epic/)).toBeInTheDocument();
  });

  it('renders the Strava social card with route map paths and scalloped seals', () => {
    render(
      <SocialCard
        feetClimbed="1.64M"
        firstYear={2016}
        grainUrl={GRAIN}
        latestTitle="Going maximalist"
        miles="27,657"
        outings="1,857"
        routePaths={[{ d: 'M10 10l50 50', tone: 'cobalt' }]}
        variant="strava"
      />,
    );

    expect(screen.getByText('Big')).toBeInTheDocument();
    expect(screen.getByText('map')).toBeInTheDocument();
    expect(screen.getByText('27,657')).toBeInTheDocument();
    expect(screen.getByText('1.64M')).toBeInTheDocument();
    expect(screen.getByText('1,857')).toBeInTheDocument();
  });
});
