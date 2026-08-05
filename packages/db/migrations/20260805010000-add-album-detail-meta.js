'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'MusicAlbum',
        'releaseDate',
        { allowNull: true, type: Sequelize.STRING },
        { transaction },
      );
      await queryInterface.addColumn(
        'MusicAlbum',
        'label',
        { allowNull: true, type: Sequelize.STRING },
        { transaction },
      );
      await queryInterface.addColumn(
        'MusicAlbum',
        'popularity',
        { allowNull: true, type: Sequelize.INTEGER },
        { transaction },
      );
      await queryInterface.addColumn(
        'MusicAlbum',
        'totalTracks',
        { allowNull: true, type: Sequelize.INTEGER },
        { transaction },
      );

      await queryInterface.addColumn(
        'MusicTrack',
        'durationMs',
        { allowNull: true, type: Sequelize.INTEGER },
        { transaction },
      );
      await queryInterface.addColumn(
        'MusicTrack',
        'trackNumber',
        { allowNull: true, type: Sequelize.INTEGER },
        { transaction },
      );
      await queryInterface.addColumn(
        'MusicTrack',
        'discNumber',
        { allowNull: true, type: Sequelize.INTEGER },
        { transaction },
      );

      await queryInterface.createTable(
        'MusicAlbumArtist',
        {
          albumId: {
            allowNull: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            primaryKey: true,
            references: { key: 'id', model: 'MusicAlbum' },
            type: Sequelize.STRING(22),
          },
          artistId: {
            allowNull: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            primaryKey: true,
            references: { key: 'id', model: 'MusicArtist' },
            type: Sequelize.STRING(22),
          },
          position: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('MusicAlbumArtist', ['artistId'], {
        name: 'idx_music_album_artist_artist_id',
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
      await queryInterface.dropTable('MusicAlbumArtist', { transaction });
      await queryInterface.removeColumn('MusicTrack', 'discNumber', { transaction });
      await queryInterface.removeColumn('MusicTrack', 'trackNumber', { transaction });
      await queryInterface.removeColumn('MusicTrack', 'durationMs', { transaction });
      await queryInterface.removeColumn('MusicAlbum', 'totalTracks', { transaction });
      await queryInterface.removeColumn('MusicAlbum', 'popularity', { transaction });
      await queryInterface.removeColumn('MusicAlbum', 'label', { transaction });
      await queryInterface.removeColumn('MusicAlbum', 'releaseDate', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
