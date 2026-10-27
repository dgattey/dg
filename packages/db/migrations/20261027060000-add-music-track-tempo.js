'use strict';

const ADD_CHECKS_SQL = `ALTER TABLE "MusicTrackTempo"
  ADD CONSTRAINT "music_track_tempo_status_check"
    CHECK ("status" IN ('found', 'missing', 'failed')),
  ADD CONSTRAINT "music_track_tempo_bpm_check"
    CHECK (("status" = 'found') = ("bpm" IS NOT NULL))`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'MusicTrackTempo',
        {
          bpm: { allowNull: true, type: Sequelize.REAL },
          checkedAt: { allowNull: false, type: Sequelize.DATE },
          isrc: { allowNull: false, primaryKey: true, type: Sequelize.STRING(12) },
          status: { allowNull: false, type: Sequelize.STRING(16) },
        },
        { transaction },
      );

      await queryInterface.sequelize.query(ADD_CHECKS_SQL, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('MusicTrackTempo', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
