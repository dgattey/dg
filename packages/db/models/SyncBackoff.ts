import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * A scheduled job that an upstream API refused, held off until `retryAt`.
 * `failures` counts consecutive refused runs so each one waits longer; a
 * successful run deletes the row.
 */
@Table({ modelName: 'SyncBackoff', timestamps: false })
export class SyncBackoff extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.INTEGER)
  declare failures: number;

  @Column(DataType.DATE)
  declare retryAt: Date;
}
