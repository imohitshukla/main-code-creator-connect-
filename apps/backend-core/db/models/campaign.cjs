'use strict';
module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define('Campaign', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true
    },
    deliverables: {
      type: DataTypes.JSON,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    niche: {
      type: DataTypes.STRING,
      allowNull: true
    },
    target_audience: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'campaigns'
  });

  Campaign.associate = (models) => {
    Campaign.belongsTo(models.User, { foreignKey: 'brand_id', as: 'brand' });
    Campaign.belongsTo(models.User, { foreignKey: 'creator_id', as: 'creator' });
    Campaign.hasMany(models.Message, { foreignKey: 'campaign_id' });
    Campaign.hasMany(models.Payment, { foreignKey: 'campaign_id' });
  };

  return Campaign;
};
