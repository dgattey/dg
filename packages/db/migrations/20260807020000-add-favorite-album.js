'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'FavoriteAlbum',
        {
          addedAt: { allowNull: false, type: Sequelize.STRING },
          artistNames: { allowNull: false, type: Sequelize.STRING },
          id: { allowNull: false, primaryKey: true, type: Sequelize.STRING(22) },
          imageUrl: { allowNull: false, type: Sequelize.STRING },
          name: { allowNull: false, type: Sequelize.STRING },
          primaryArtist: { allowNull: false, type: Sequelize.STRING },
          releaseDate: { allowNull: false, type: Sequelize.STRING },
          url: { allowNull: false, type: Sequelize.STRING },
        },
        { transaction },
      );

      await queryInterface.addIndex('FavoriteAlbum', ['addedAt'], {
        name: 'idx_favorite_album_added_at',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('FavoriteAlbum');
  },
};
