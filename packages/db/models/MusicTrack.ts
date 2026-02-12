import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MusicAlbum } from './MusicAlbum';
import { MusicArtist } from './MusicArtist';

// Spotify IDs are 22 characters (base62)
const ID_LENGTH = 22;

@Table({ modelName: 'MusicTrack', timestamps: false })
export class MusicTrack extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @ForeignKey(() => MusicAlbum)
  @Column(DataType.STRING(ID_LENGTH))
  declare albumId: string;

  @BelongsTo(() => MusicAlbum)
  declare album: MusicAlbum;

  @Column({ allowNull: true, type: DataType.STRING })
  declare url: string | null;

  // Use string reference 'MusicTrackArtist' to avoid import cycle
  @BelongsToMany(() => MusicArtist, 'MusicTrackArtist', 'trackId', 'artistId')
  declare artists: Array<MusicArtist>;
}
