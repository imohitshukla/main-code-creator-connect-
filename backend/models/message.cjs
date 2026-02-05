'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL for system messages
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_system_message: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'messages',
    timestamps: false,
    indexes: [
      {
        fields: ['conversation_id'],
        name: 'messages_conversation_id_index'
      },
      {
        fields: ['sender_id'],
        name: 'messages_sender_id_index'
      },
      {
        fields: ['created_at'],
        name: 'messages_created_at_index'
      },
      {
        fields: ['is_system_message'],
        name: 'messages_system_message_index'
      }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });
    Message.belongsTo(models.User, { as: 'sender', foreignKey: 'sender_id' });
  };

  return Message;
};
