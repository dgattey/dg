import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * `spotify` is Spotify's 0–100 track popularity. `deezer` is Deezer's 0–1,000,000
 * rank scaled to 0–100, stored only when Spotify returned no popularity, so the
 * two never describe the same track on the same day.
 */
export type MusicTrackPopularitySource = 'spotify' | 'deezer';

/**
 * A track's popularity as read on one Pacific calendar day. Rows are written when
 * plays are synced or imported, so a play's popularity is the snapshot closest to
 * when it was played, and older plays fall back to the earliest snapshot taken.
 */
@Table({ modelName: 'MusicTrackPopularity', timestamps: false })
export class MusicTrackPopularity extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare trackId: string;

  @PrimaryKey
  @Column(DataType.STRING(8))
  declare source: MusicTrackPopularitySource;

  @PrimaryKey
  @Column(DataType.DATEONLY)
  declare capturedOn: string;

  @Column(DataType.SMALLINT)
  declare popularity: number;
}
