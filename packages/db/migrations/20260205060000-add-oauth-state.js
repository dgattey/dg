'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OauthState', {
      state: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.STRING(64),
      },
      provider: {
        allowNull: false,
        type: Sequelize.STRING(32),
      },
      codeVerifier: {
        type: Sequelize.STRING(128),
      },
      expiresAt: {
        allowNull: false,
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable('OauthState');
  },
};
