// migrations/002-update-favorites-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter les nouvelles colonnes pour supporter différents types de favoris
    await queryInterface.addColumn('favorites', 'salon_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'salons',
        key: 'id'
      }
    });

    await queryInterface.addColumn('favorites', 'hairstyle_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'hairstyles',
        key: 'id'
      }
    });

    await queryInterface.addColumn('favorites', 'favorite_type', {
      type: Sequelize.ENUM('hairdresser', 'salon', 'hairstyle'),
      allowNull: false,
      defaultValue: 'hairdresser'
    });

    // Mettre à jour les enregistrements existants
    await queryInterface.sequelize.query(`
      UPDATE favorites 
      SET favorite_type = 'hairdresser' 
      WHERE favorite_type IS NULL OR favorite_type = ''
    `);

    // Rendre les anciennes colonnes nullable
    await queryInterface.changeColumn('favorites', 'hairdresser_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // Supprimer l'ancien index unique
    await queryInterface.removeIndex('favorites', 'favorites_client_id_hairdresser_id_unique');

    // Créer de nouveaux indexes conditionnels
    await queryInterface.addIndex('favorites', ['client_id', 'favorite_type', 'hairdresser_id'], {
      unique: true,
      where: {
        hairdresser_id: { [Sequelize.Op.ne]: null }
      },
      name: 'favorites_client_hairdresser_unique'
    });

    await queryInterface.addIndex('favorites', ['client_id', 'favorite_type', 'salon_id'], {
      unique: true,
      where: {
        salon_id: { [Sequelize.Op.ne]: null }
      },
      name: 'favorites_client_salon_unique'
    });

    await queryInterface.addIndex('favorites', ['client_id', 'favorite_type', 'hairstyle_id'], {
      unique: true,
      where: {
        hairstyle_id: { [Sequelize.Op.ne]: null }
      },
      name: 'favorites_client_hairstyle_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer les nouveaux indexes
    await queryInterface.removeIndex('favorites', 'favorites_client_hairdresser_unique');
    await queryInterface.removeIndex('favorites', 'favorites_client_salon_unique');
    await queryInterface.removeIndex('favorites', 'favorites_client_hairstyle_unique');

    // Rendre l'ancienne colonne non nullable
    await queryInterface.changeColumn('favorites', 'hairdresser_id', {
      type: Sequelize.UUID,
      allowNull: false
    });

    // Supprimer les nouvelles colonnes
    await queryInterface.removeColumn('favorites', 'favorite_type');
    await queryInterface.removeColumn('favorites', 'salon_id');
    await queryInterface.removeColumn('favorites', 'hairstyle_id');

    // Recréer l'ancien index unique
    await queryInterface.addIndex('favorites', ['client_id', 'hairdresser_id'], {
      unique: true,
      name: 'favorites_client_id_hairdresser_id_unique'
    });
  }
};
