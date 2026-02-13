// models/History.js
module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define('History', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    hairdresser_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hairdressers',
        key: 'id'
      }
    },
    hairstyle_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'hairstyles',
        key: 'id'
      }
    },
    client_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    client_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    booking_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    booking_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('completed', 'cancelled', 'no_show'),
      allowNull: false,
      defaultValue: 'completed'
    },
    final_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['client_id']
      },
      {
        fields: ['hairdresser_id']
      },
      {
        fields: ['booking_date']
      },
      {
        fields: ['archived_at']
      }
    ]
  });

  History.associate = (models) => {
    History.belongsTo(models.User, {
      foreignKey: 'client_id',
      as: 'client'
    });
    
    History.belongsTo(models.Hairdresser, {
      foreignKey: 'hairdresser_id',
      as: 'hairdresser',
      include: [{
        model: models.User,
        as: 'user'
      }]
    });
    
    History.belongsTo(models.Hairstyle, {
      foreignKey: 'hairstyle_id',
      as: 'hairstyle'
    });
    
    History.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
  };

  return History;
};
