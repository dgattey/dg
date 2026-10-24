'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'Release',
        {
          body: { allowNull: false, type: Sequelize.TEXT },
          publishedAt: { allowNull: false, type: Sequelize.DATE },
          url: { allowNull: false, type: Sequelize.TEXT },
          version: { allowNull: false, primaryKey: true, type: Sequelize.STRING(64) },
        },
        { transaction },
      );

      await queryInterface.addIndex('Release', ['publishedAt'], {
        name: 'idx_release_published_at',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Release', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
