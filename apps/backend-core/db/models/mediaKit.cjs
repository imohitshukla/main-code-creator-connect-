'use strict';
module.exports = (sequelize, DataTypes) => {
  const MediaKit = sequelize.define('MediaKit', {
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
    content: {
      type: DataTypes.JSON,
      allowNull: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'media_kits'
  });

  MediaKit.associate = (models) => {
    MediaKit.belongsTo(models.User, { foreignKey: 'creator_id' });
  };

  return MediaKit;
};
