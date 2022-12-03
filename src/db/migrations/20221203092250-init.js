'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('Token', {
        name: {
          allowNull: false,
          primaryKey: true,
          unique: true,
          type: Sequelize.STRING,
        },
        accessToken: {
          type: Sequelize.STRING(768),
        },
        refreshToken: {
          type: Sequelize.STRING(768),
        },
        expiryAt: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });

      await queryInterface.createTable('StravaActivity', {
        id: {
          allowNull: false,
          primaryKey: true,
          unique: true,
          type: Sequelize.BIGINT,
        },
        activityStartDate: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        activityData: {
          allowNull: false,
          type: Sequelize.JSON,
        },
        lastUpdate: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Token');
      await queryInterface.dropTable('StravaActivity');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
