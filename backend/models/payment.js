'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'campaigns',
        key: 'id'
      }
    },
    payer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    payee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'payments'
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Campaign, { foreignKey: 'campaign_id' });
    Payment.belongsTo(models.User, { foreignKey: 'payer_id', as: 'payer' });
    Payment.belongsTo(models.User, { foreignKey: 'payee_id', as: 'payee' });
  };

  return Payment;
};
