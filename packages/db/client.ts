import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getDatabaseUrl, getDatabaseUrlOrPlaceholder, sequelizeOptions } from './dbConfig';
import { FavoriteAlbum } from './models/FavoriteAlbum';
import { FavoriteAlbumSnapshot } from './models/FavoriteAlbumSnapshot';
import { MusicAlbum } from './models/MusicAlbum';
import { MusicAlbumArtist } from './models/MusicAlbumArtist';
import { MusicArtist } from './models/MusicArtist';
import { MusicPlaylist } from './models/MusicPlaylist';
import { MusicTrack } from './models/MusicTrack';
import { MusicTrackArtist } from './models/MusicTrackArtist';
import { MusicTrackTempo } from './models/MusicTrackTempo';
import { OauthState } from './models/OauthState';
import { Release } from './models/Release';
import { SpotifyPlay } from './models/SpotifyPlay';
import { StravaActivity } from './models/StravaActivity';
import { StravaHistorySummary } from './models/StravaHistorySummary';
import { Token } from './models/Token';

export const db = {
  FavoriteAlbum,
  FavoriteAlbumSnapshot,
  MusicAlbum,
  MusicAlbumArtist,
  MusicArtist,
  MusicPlaylist,
  MusicTrack,
  MusicTrackArtist,
  MusicTrackTempo,
  OauthState,
  Release,
  SpotifyPlay,
  StravaActivity,
  StravaHistorySummary,
  Token,
} as const;

export const dbClient = new Sequelize(getDatabaseUrlOrPlaceholder(), {
  define: { freezeTableName: true },
  hooks: {
    beforeConnect: () => {
      getDatabaseUrl();
    },
  },
  models: Object.values(db),
  ...sequelizeOptions,
});

export { Op, QueryTypes };

export async function closeDbConnection(): Promise<void> {
  try {
    await dbClient.close();
  } catch {}
}
