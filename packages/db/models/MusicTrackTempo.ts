import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

const ISRC_LENGTH = 12;

/**
 * `found` and `missing` are permanent answers; `failed` records a timeout or
 * outage so the lookup retries once `checkedAt` is old enough.
 */
export type MusicTrackTempoStatus = 'found' | 'missing' | 'failed';

/**
 * Tempo of a recording, keyed by ISRC so every Spotify release of the same
 * recording shares one lookup, including tracks still playing that the
 * history sync has not stored yet.
 */
@Table({ modelName: 'MusicTrackTempo', timestamps: false })
export class MusicTrackTempo extends Model {
  @PrimaryKey
  @Column(DataType.STRING(ISRC_LENGTH))
  declare isrc: string;

  @Column({ allowNull: true, type: DataType.REAL })
  declare bpm: number | null;

  @Column(DataType.STRING(16))
  declare status: MusicTrackTempoStatus;

  @Column(DataType.DATE)
  declare checkedAt: Date;
}
