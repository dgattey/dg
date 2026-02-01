import type { StravaActivity as StravaActivityData } from '@dg/content-models/strava/StravaActivity';
import {
  AllowNull,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({ modelName: 'StravaActivity' })
export class StravaActivity extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.BIGINT)
  declare id: number;

  @Column(DataType.DATE)
  declare activityStartDate: Date;

  @Column(DataType.JSON)
  declare activityData: StravaActivityData;

  @AllowNull
  @Column(DataType.DATE)
  declare lastUpdate: Date;
}
