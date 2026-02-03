import { Column, DataType, Index, Model, PrimaryKey, Table } from 'sequelize-typescript';

// Spotify IDs are 22 characters (base62)
const SPOTIFY_ID_LENGTH = 22;

@Table({ modelName: 'SpotifyPlay', timestamps: false })
export class SpotifyPlay extends Model {
  @PrimaryKey
  @Index('idx_spotify_play_played_at')
  @Column(DataType.DATE)
  declare playedAt: Date;

  @PrimaryKey
  @Index('idx_spotify_play_track_id')
  @Column(DataType.STRING(SPOTIFY_ID_LENGTH))
  declare trackId: string;

  @Index('idx_spotify_play_album_id')
  @Column(DataType.STRING(SPOTIFY_ID_LENGTH))
  declare albumId: string;

  @Column(DataType.ARRAY(DataType.STRING(SPOTIFY_ID_LENGTH)))
  declare artistIds: Array<string>;
}
