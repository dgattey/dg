import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * Marks that the favorite-albums snapshot has completed at least once.
 * The row is separate from FavoriteAlbum so an intentionally empty playlist
 * can be distinguished from a snapshot that has never been populated.
 */
@Table({ modelName: 'FavoriteAlbumSnapshot', timestamps: false })
export class FavoriteAlbumSnapshot extends Model {
  @PrimaryKey
  @Column(DataType.BOOLEAN)
  declare singleton: boolean;

  @Column(DataType.DATE)
  declare refreshedAt: Date;
}
