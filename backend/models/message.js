'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'campaigns',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'messages'
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    Message.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'receiver' });
    Message.belongsTo(models.Campaign, { foreignKey: 'campaign_id' });
  };

  return Message;
};
