import {
  AllowNull,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import type { StravaDetailedActivity } from './StravaDetailedActivity';

@Table({ modelName: 'StravaActivity' })
export class StravaActivity extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.BIGINT)
  declare id: number;

  @Column(DataType.DATE)
  declare activityStartDate: Date;

  @Column(DataType.JSON)
  declare activityData: Record<string, unknown> & StravaDetailedActivity;

  @AllowNull
  @Column(DataType.DATE)
  declare lastUpdate: Date;
}
