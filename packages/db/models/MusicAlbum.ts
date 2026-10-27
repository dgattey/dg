import { BelongsToMany, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { MusicArtist } from './MusicArtist';

// Spotify IDs are 22 characters (base62)
const ID_LENGTH = 22;

@Table({ modelName: 'MusicAlbum', timestamps: false })
export class MusicAlbum extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare imageUrl: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare url: string | null;

  @Column({ allowNull: true, type: DataType.STRING })
  declare releaseDate: string | null;

  @Column({ allowNull: true, type: DataType.STRING })
  declare label: string | null;

  @Column({ allowNull: true, type: DataType.INTEGER })
  declare popularity: number | null;

  @Column({ allowNull: true, type: DataType.INTEGER })
  declare totalTracks: number | null;

  @BelongsToMany(() => MusicArtist, 'MusicAlbumArtist', 'albumId', 'artistId')
  declare artists: Array<MusicArtist>;
}
