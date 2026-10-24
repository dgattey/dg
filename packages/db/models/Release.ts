import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

const MAX_VERSION_LENGTH = 64;

/**
 * Persisted changelog release record, dual-written by CI on every release and
 * backfilled across the full repository history since 2016.
 */
@Table({ modelName: 'Release', timestamps: false })
export class Release extends Model {
  @PrimaryKey
  @Column(DataType.STRING(MAX_VERSION_LENGTH))
  declare version: string;

  @Column(DataType.DATE)
  declare publishedAt: Date;

  @Column(DataType.TEXT)
  declare url: string;

  @Column(DataType.TEXT)
  declare body: string;
}
