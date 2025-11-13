'use strict';
module.exports = (sequelize, DataTypes) => {
  const CreatorProfile = sequelize.define('CreatorProfile', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    portfolio_links: {
      type: DataTypes.JSON,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    social_media: {
      type: DataTypes.JSON,
      allowNull: true
    },
    niche: {
      type: DataTypes.STRING,
      allowNull: true
    },
    follower_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    engagement_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'creator_profiles'
  });

  CreatorProfile.associate = (models) => {
    CreatorProfile.belongsTo(models.User, { foreignKey: 'user_id' });
    CreatorProfile.hasMany(models.MediaKit, { foreignKey: 'creator_id' });
    CreatorProfile.hasMany(models.Campaign, { foreignKey: 'creator_id' });
  };

  return CreatorProfile;
};
