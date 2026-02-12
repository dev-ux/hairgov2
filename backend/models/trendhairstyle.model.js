'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TrendHairstyle extends Model {
    static associate(models) {
      // Association avec Hairstyle
      TrendHairstyle.belongsTo(models.Hairstyle, {
        foreignKey: 'hairstyle_id',
        as: 'hairstyle'
      });
    }
  }

  TrendHairstyle.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hairstyle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hairstyles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    trending_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
      comment: 'Score de tendance (0.00 à 5.00)'
    },
    category: {
      type: DataTypes.ENUM('Homme', 'Femme', 'Mixte', 'Enfant'),
      allowNull: false,
      defaultValue: 'Mixte'
    },
    difficulty: {
      type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
      allowNull: false,
      defaultValue: 'moyen'
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Durée estimée en minutes'
    },
    price_range: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Gamme de prix (ex: 30-50€)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Indique si la tendance est active'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de début de la tendance'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de fin de la tendance'
    },
    added_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Admin qui a ajouté cette tendance'
    }
  }, {
    sequelize,
    modelName: 'TrendHairstyle',
    tableName: 'trend_hairstyles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return TrendHairstyle;
};
