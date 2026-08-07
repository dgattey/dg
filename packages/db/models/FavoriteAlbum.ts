import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

// Spotify IDs are 22 characters (base62)
const ID_LENGTH = 22;

/**
 * Last known good snapshot of the curated favorites playlist. Playlist
 * membership and add order live only at Spotify, so without this a rate-limited
 * or failed playlist fetch leaves the albums page with nothing to show.
 * Stored flat, exactly as the grid consumes it.
 */
@Table({ modelName: 'FavoriteAlbum', timestamps: false })
export class FavoriteAlbum extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare artistNames: string;

  @Column(DataType.STRING)
  declare primaryArtist: string;

  @Column(DataType.STRING)
  declare imageUrl: string;

  @Column(DataType.STRING)
  declare url: string;

  /** ISO timestamp the album first entered the playlist; sorts newest first. */
  @Column(DataType.STRING)
  declare addedAt: string;

  /** Release date as Spotify reports it: YYYY, YYYY-MM, or YYYY-MM-DD. */
  @Column(DataType.STRING)
  declare releaseDate: string;
}
