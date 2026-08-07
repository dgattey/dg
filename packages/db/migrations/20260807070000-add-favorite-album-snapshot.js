'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FavoriteAlbumSnapshot', {
      refreshedAt: { allowNull: false, type: Sequelize.DATE },
      singleton: {
        allowNull: false,
        defaultValue: true,
        primaryKey: true,
        type: Sequelize.BOOLEAN,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('FavoriteAlbumSnapshot');
  },
};
