import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { htmlPathToMarkdownPath, musicRoute } from '@dg/shared-core/routes/app';
import { Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { absoluteUrl } from '../../services/markdown/siteUrl';
import { getMusicHistory } from '../../services/music';
import { MarkdownAlternateHint } from '../layouts/MarkdownAlternateHint';
import { MusicInfiniteScroll } from './MusicInfiniteScroll';

const markdownPath = htmlPathToMarkdownPath(musicRoute) ?? '/music.md';

export const metadata: Metadata = {
  alternates: {
    types: {
      'text/markdown': markdownPath,
    },
  },
  title: 'Listening history',
};

export default async function MusicPage() {
  let tracks: Awaited<ReturnType<typeof getMusicHistory>>['tracks'];
  let nextCursor: Awaited<ReturnType<typeof getMusicHistory>>['nextCursor'];

  try {
    const result = await getMusicHistory({});
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
      <MarkdownAlternateHint markdownUrl={absoluteUrl(markdownPath)} />
      <Stack spacing={2}>
        <Typography variant="h1">Listening history</Typography>
        <MusicInfiniteScroll initialCursor={nextCursor} initialTracks={tracks} />
      </Stack>
    </main>
  );
}
