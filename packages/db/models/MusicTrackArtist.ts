import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

// Spotify IDs are 22 characters (base62)
const ID_LENGTH = 22;

/**
 * Junction table for many-to-many relationship between MusicTrack and MusicArtist.
 * Foreign keys are declared but not enforced via decorators to avoid import cycles.
 * The database migration handles the actual FK constraints.
 */
@Table({ modelName: 'MusicTrackArtist', timestamps: false })
export class MusicTrackArtist extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare trackId: string;

  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare artistId: string;

  @Column(DataType.INTEGER)
  declare position: number;
}
