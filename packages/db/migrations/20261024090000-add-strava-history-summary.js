'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'StravaHistorySummary',
        {
          activityCount: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          computedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          latestActivityId: {
            allowNull: true,
            type: Sequelize.BIGINT,
          },
          latestActivityUpdatedAt: {
            allowNull: true,
            type: Sequelize.DATE,
          },
          payload: {
            allowNull: true,
            type: Sequelize.JSONB,
          },
          schemaVersion: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          singleton: {
            allowNull: false,
            defaultValue: true,
            primaryKey: true,
            type: Sequelize.BOOLEAN,
          },
        },
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
      await queryInterface.dropTable('StravaHistorySummary', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
