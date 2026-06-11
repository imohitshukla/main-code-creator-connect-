'use strict';
module.exports = (sequelize, DataTypes) => {
  const DealTimelineLog = sequelize.define('DealTimelineLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'deals',
        key: 'id'
      }
    },
    old_stage: {
      type: DataTypes.ENUM('AGREEMENT_SIGNED', 'SHIPPING_LOGISTICS', 'SCRIPT_APPROVAL', 'DRAFT_REVIEW', 'GO_LIVE', 'PAYMENT_RELEASE', 'COMPLETED'),
      allowNull: false
    },
    new_stage: {
      type: DataTypes.ENUM('AGREEMENT_SIGNED', 'SHIPPING_LOGISTICS', 'SCRIPT_APPROVAL', 'DRAFT_REVIEW', 'GO_LIVE', 'PAYMENT_RELEASE', 'COMPLETED'),
      allowNull: false
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'deal_timeline_logs',
    timestamps: false,
    indexes: [
      {
        fields: ['deal_id'],
        name: 'deal_timeline_logs_deal_id_index'
      },
      {
        fields: ['timestamp'],
        name: 'deal_timeline_logs_timestamp_index'
      }
    ]
  });

  DealTimelineLog.associate = (models) => {
    DealTimelineLog.belongsTo(models.Deal, { foreignKey: 'deal_id' });
    DealTimelineLog.belongsTo(models.User, { as: 'changedByUser', foreignKey: 'changed_by' });
  };

  return DealTimelineLog;
};
