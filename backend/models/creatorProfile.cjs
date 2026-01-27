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
      type: DataTypes.STRING,
      defaultValue: '0'
    },
    engagement_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    audience: {
      type: DataTypes.JSON,
      allowNull: true
    },
    budget: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    instagram_link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    youtube_link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    portfolio_link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    audience_breakdown: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    budget_range: {
      type: DataTypes.STRING,
      allowNull: true
    },
    collaboration_goals: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'creator_profiles',
    // Disable automatic timestamp columns so Sequelize
    // does NOT try to read/write `createdAt` / `updatedAt`,
    // which do not exist on this table in your database.
    timestamps: false
  });

  CreatorProfile.associate = (models) => {
    CreatorProfile.belongsTo(models.User, { foreignKey: 'user_id' });
    CreatorProfile.hasMany(models.MediaKit, { foreignKey: 'creator_id' });
    CreatorProfile.hasMany(models.Campaign, { foreignKey: 'creator_id' });
  };

  return CreatorProfile;
};
