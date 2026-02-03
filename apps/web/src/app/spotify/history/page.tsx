import 'server-only';

import { isMissingTokenError } from '@dg/services/clients/MissingTokenError';
import { Link } from '@dg/ui/dependent/Link';
import { Stack, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { SpotifyHistoryGrid } from '../../../components/spotify/SpotifyHistoryGrid';
import { getSpotifyHistory, parseSpotifyHistoryCursor } from '../../../services/spotify';

type Props = {
  searchParams?: {
    before?: string | Array<string>;
  };
};

export default async function SpotifyHistoryPage({ searchParams }: Props) {
  const before = parseSpotifyHistoryCursor(searchParams?.before);
  let tracks: Awaited<ReturnType<typeof getSpotifyHistory>>['tracks'];
  let nextCursor: Awaited<ReturnType<typeof getSpotifyHistory>>['nextCursor'];

  try {
    const result = await getSpotifyHistory({ before });
    tracks = result.tracks;
    nextCursor = result.nextCursor;
  } catch (error) {
    // In development, redirect to the dev page to set up OAuth
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect('/dev');
    }
    throw error;
  }

  return (
    <main>
      <Stack spacing={2}>
        <Typography variant="h1">Listening History</Typography>
        {tracks.length > 0 ? (
          <SpotifyHistoryGrid tracks={tracks} />
        ) : (
          <Typography>No listening history yet.</Typography>
        )}
        {nextCursor ? (
          <Link href={`/spotify/history?before=${encodeURIComponent(nextCursor)}`}>Load more</Link>
        ) : null}
      </Stack>
    </main>
  );
}
