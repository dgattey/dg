import { Op } from 'sequelize';
import { SpotifyPlay } from './models/SpotifyPlay';

type SpotifyHistoryRowsOptions = {
  before?: Date;
  limit: number;
};

export type SpotifyHistoryRow = {
  playedAt: Date;
  trackId: string;
};

export function fetchSpotifyHistoryRows({
  before,
  limit,
}: SpotifyHistoryRowsOptions): Promise<Array<SpotifyHistoryRow>> {
  const whereClause = before ? { playedAt: { [Op.lt]: before } } : {};

  return SpotifyPlay.findAll({
    attributes: ['playedAt', 'trackId'],
    limit,
    order: [['playedAt', 'DESC']],
    where: whereClause,
  });
}
