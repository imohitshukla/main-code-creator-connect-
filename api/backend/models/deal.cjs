'use strict';
module.exports = (sequelize, DataTypes) => {
  const Deal = sequelize.define('Deal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    current_stage: {
      type: DataTypes.ENUM('AGREEMENT_SIGNED', 'SHIPPING_LOGISTICS', 'SCRIPT_APPROVAL', 'DRAFT_REVIEW', 'GO_LIVE', 'PAYMENT_RELEASE'),
      defaultValue: 'AGREEMENT_SIGNED',
      allowNull: false
    },
    stage_metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'COMPLETED', 'DISPUTE'),
      defaultValue: 'ACTIVE',
      allowNull: false
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelled_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    agreement_signed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'deals',
    timestamps: false,
    indexes: [
      {
        fields: ['brand_id'],
        name: 'deals_brand_id_index'
      },
      {
        fields: ['creator_id'],
        name: 'deals_creator_id_index'
      },
      {
        fields: ['current_stage'],
        name: 'deals_stage_index'
      }
    ]
  });

  Deal.associate = (models) => {
    Deal.belongsTo(models.User, { as: 'brand', foreignKey: 'brand_id' });
    Deal.belongsTo(models.User, { as: 'creator', foreignKey: 'creator_id' });
  };

  return Deal;
};
