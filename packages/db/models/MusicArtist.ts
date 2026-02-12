import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

// Spotify IDs are 22 characters (base62)
const ID_LENGTH = 22;

@Table({ modelName: 'MusicArtist', timestamps: false })
export class MusicArtist extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ID_LENGTH))
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare url: string | null;
}
