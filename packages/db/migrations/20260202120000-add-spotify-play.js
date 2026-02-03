'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'SpotifyPlay',
        {
          playedAt: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.DATE,
          },
          trackId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
          },
          albumId: {
            allowNull: false,
            type: Sequelize.STRING(22),
          },
          artistIds: {
            allowNull: false,
            type: Sequelize.ARRAY(Sequelize.STRING(22)),
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('SpotifyPlay', ['trackId'], {
        name: 'idx_spotify_play_track_id',
        transaction,
      });
      await queryInterface.addIndex('SpotifyPlay', ['albumId'], {
        name: 'idx_spotify_play_album_id',
        transaction,
      });
      await queryInterface.addIndex('SpotifyPlay', ['playedAt'], {
        name: 'idx_spotify_play_played_at',
        transaction,
      });

      await queryInterface.sequelize.query(
        'CREATE INDEX idx_spotify_play_artist_ids ON "SpotifyPlay" USING GIN ("artistIds")',
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('SpotifyPlay', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
