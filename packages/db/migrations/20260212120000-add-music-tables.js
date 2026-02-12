'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create MusicArtist table
      await queryInterface.createTable(
        'MusicArtist',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          url: {
            allowNull: true,
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );

      // Create MusicAlbum table
      await queryInterface.createTable(
        'MusicAlbum',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          imageUrl: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          url: {
            allowNull: true,
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );

      // Create MusicTrack table
      await queryInterface.createTable(
        'MusicTrack',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          albumId: {
            allowNull: false,
            type: Sequelize.STRING(22),
            references: {
              model: 'MusicAlbum',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          url: {
            allowNull: true,
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );

      // Create MusicTrackArtist junction table
      await queryInterface.createTable(
        'MusicTrackArtist',
        {
          trackId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
            references: {
              model: 'MusicTrack',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          artistId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING(22),
            references: {
              model: 'MusicArtist',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          position: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
        },
        { transaction },
      );

      // Add indexes
      await queryInterface.addIndex('MusicTrack', ['albumId'], {
        name: 'idx_music_track_album_id',
        transaction,
      });
      await queryInterface.addIndex('MusicTrackArtist', ['artistId'], {
        name: 'idx_music_track_artist_artist_id',
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
      // Drop tables in reverse order (junction first, then tables with FK dependencies)
      await queryInterface.dropTable('MusicTrackArtist', { transaction });
      await queryInterface.dropTable('MusicTrack', { transaction });
      await queryInterface.dropTable('MusicAlbum', { transaction });
      await queryInterface.dropTable('MusicArtist', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
