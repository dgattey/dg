'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "MusicArtist" ADD COLUMN IF NOT EXISTS "genres" VARCHAR(255)[] NOT NULL DEFAULT \'{}\';',
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "MusicArtist" DROP COLUMN IF EXISTS "genres";',
    );
  },
};
