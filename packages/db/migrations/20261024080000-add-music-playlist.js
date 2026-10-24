'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'MusicPlaylist',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
          },
          imageUrl: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          totalTracks: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          trackIds: {
            allowNull: false,
            type: Sequelize.ARRAY(Sequelize.STRING(22)),
          },
          url: {
            allowNull: true,
            type: Sequelize.STRING,
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
      await queryInterface.dropTable('MusicPlaylist', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
