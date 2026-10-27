'use strict';

const ADD_KEY_AND_CHECKS_SQL = `ALTER TABLE "MusicTrackPopularity"
  ADD PRIMARY KEY ("trackId", "source", "capturedOn"),
  ADD CONSTRAINT "music_track_popularity_source_check"
    CHECK ("source" IN ('spotify', 'deezer')),
  ADD CONSTRAINT "music_track_popularity_range_check"
    CHECK ("popularity" BETWEEN 0 AND 100)`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'MusicTrackPopularity',
        {
          capturedOn: { allowNull: false, type: Sequelize.DATEONLY },
          popularity: { allowNull: false, type: Sequelize.SMALLINT },
          source: { allowNull: false, type: Sequelize.STRING(8) },
          trackId: { allowNull: false, type: Sequelize.STRING },
        },
        { transaction },
      );

      await queryInterface.sequelize.query(ADD_KEY_AND_CHECKS_SQL, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('MusicTrackPopularity', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
