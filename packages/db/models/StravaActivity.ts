import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Unique,
  DataType,
  AllowNull,
} from 'sequelize-typescript';
import type { StravaDetailedActivity } from './StravaDetailedActivity';

@Table({ modelName: 'StravaActivity' })
export class StravaActivity extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.BIGINT)
  declare id: number;

  @Column(DataType.DATE)
  activityStartDate!: Date;

  @Column(DataType.JSON)
  activityData!: Record<string, unknown> & StravaDetailedActivity;

  @AllowNull
  @Column(DataType.DATE)
  lastUpdate!: Date;
}
