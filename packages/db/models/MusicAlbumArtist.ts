import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

// Spotify IDs are 22 characters (base62)
const ID_LENGTH = 22;

/**
 * Junction table for album-level artists. Foreign keys are declared but not
 * enforced via decorators to avoid import cycles; the migration owns the FKs.
 */
@Table({ modelName: 'MusicAlbumArtist', timestamps: false })
export class MusicAlbumArtist extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare albumId: string;

  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare artistId: string;

  @Column(DataType.INTEGER)
  declare position: number;
}
