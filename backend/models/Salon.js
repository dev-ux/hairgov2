const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Salon = sequelize.define('Salon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le nom du salon est requis'
        },
        len: {
          args: [2, 255],
          msg: 'Le nom du salon doit contenir entre 2 et 255 caractères'
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'L\'adresse du salon est requise'
        }
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: {
          args: [-90],
          msg: 'La latitude doit être comprise entre -90 et 90 degrés'
        },
        max: {
          args: [90],
          msg: 'La latitude doit être comprise entre -90 et 90 degrés'
        }
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: {
          args: [-180],
          msg: 'La longitude doit être comprise entre -180 et 180 degrés'
        },
        max: {
          args: [180],
          msg: 'La longitude doit être comprise entre -180 et 180 degrés'
        }
      }
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      validate: {
        isUrlArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Les photos doivent être un tableau d\'URLs');
          }
          if (value) {
            value.forEach(url => {
              try {
                new URL(url);
              } catch (e) {
                throw new Error(`URL de photo invalide: ${url}`);
              }
            });
          }
        }
      }
    },
    is_validated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'Format de téléphone invalide (format: +225XXXXXXXXX)'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Format d\'email invalide'
        }
      }
    },
    business_hours: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidBusinessHours(value) {
          if (!value) return;
          
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          
          for (const day of days) {
            if (value[day]) {
              if (!value[day].open || !value[day].close) {
                throw new Error(`Les heures d'ouverture et de fermeture sont requises pour ${day}`);
              }
              if (!timeRegex.test(value[day].open) || !timeRegex.test(value[day].close)) {
                throw new Error(`Format d'heure invalide pour ${day}. Utilisez le format HH:MM`);
              }
            }
          }
        }
      }
    }
  }, {
    tableName: 'salons',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (salon) => {
        if (salon.latitude && salon.longitude) {
          salon.location = {
            type: 'Point',
            coordinates: [salon.longitude, salon.latitude],
            crs: { type: 'name', properties: { name: 'EPSG:4326' } }
          };
        }
      },
      beforeUpdate: (salon) => {
        if (salon.changed('latitude') || salon.changed('longitude')) {
          salon.location = {
            type: 'Point',
            coordinates: [salon.longitude, salon.latitude],
            crs: { type: 'name', properties: { name: 'EPSG:4326' } }
          };
        }
      }
    }
  });

  // Méthodes d'instance
  Salon.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.location?.crs;
    return values;
  };

  return Salon;
};
