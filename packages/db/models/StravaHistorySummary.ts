import type {
  StravaBike,
  StravaHistory,
  StravaOuting,
  StravaSport,
} from '@dg/content-models/strava/StravaHistory';
import type { CoverageCity } from '@dg/content-models/strava/StreetCoverage';
import { AllowNull, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

export type PackedStravaOutingTuple =
  | [
      id: number,
      name: string,
      sport: StravaSport,
      startEpochMs: number,
      distanceMeters: number,
      elevationGainMeters: number,
      movingTimeSeconds: number,
      polylineIndex: number | null,
    ]
  | [
      id: number,
      name: string,
      sport: StravaSport,
      startEpochMs: number,
      distanceMeters: number,
      elevationGainMeters: number,
      movingTimeSeconds: number,
      polylineIndex: number | null,
      customUrl: string,
    ];

export type StravaHistorySummaryPayload = {
  bikes: ReadonlyArray<StravaBike>;
  latest: StravaOuting;
  outings: ReadonlyArray<PackedStravaOutingTuple>;
  polylines: ReadonlyArray<string>;
  streetCoverageRidden: Readonly<
    Record<CoverageCity, Readonly<Record<string, ReadonlyArray<number>>>>
  >;
  totals: StravaHistory['totals'];
};

/**
 * Precomputed singleton summary of all stored Strava activities, keyed by
 * schema version and the source table's row count, latest activity id, and
 * latest update timestamp so reads fetch one compact row instead of scanning
 * and decoding every activity polyline.
 */
@Table({ modelName: 'StravaHistorySummary', timestamps: false })
export class StravaHistorySummary extends Model {
  @PrimaryKey
  @Column(DataType.BOOLEAN)
  declare singleton: boolean;

  @Column(DataType.INTEGER)
  declare schemaVersion: number;

  @Column(DataType.INTEGER)
  declare activityCount: number;

  @AllowNull
  @Column(DataType.BIGINT)
  declare latestActivityId: number | null;

  @AllowNull
  @Column(DataType.DATE)
  declare latestActivityUpdatedAt: Date | null;

  @Column(DataType.DATE)
  declare computedAt: Date;

  @AllowNull
  @Column(DataType.JSONB)
  declare payload: StravaHistorySummaryPayload | null;
}
