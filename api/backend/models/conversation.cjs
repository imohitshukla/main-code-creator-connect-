'use strict';
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'deals',
        key: 'id'
      }
    },
    participant_1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    participant_2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'conversations',
    timestamps: false,
    indexes: [
      {
        fields: ['deal_id'],
        name: 'conversations_deal_id_index'
      },
      {
        fields: ['participant_1_id'],
        name: 'conversations_participant_1_index'
      },
      {
        fields: ['participant_2_id'],
        name: 'conversations_participant_2_index'
      },
      {
        fields: ['last_message_at'],
        name: 'conversations_last_message_index'
      }
    ]
  });

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.Deal, { foreignKey: 'deal_id' });
    Conversation.belongsTo(models.User, { as: 'participant1', foreignKey: 'participant_1_id' });
    Conversation.belongsTo(models.User, { as: 'participant2', foreignKey: 'participant_2_id' });
    Conversation.hasMany(models.Message, { foreignKey: 'conversation_id' });
  };

  return Conversation;
};
