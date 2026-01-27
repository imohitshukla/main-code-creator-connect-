'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile_image: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'creator'
    },
    // ✅ NEW COLUMNS (Syncing with DB)
    niche: {
      type: DataTypes.STRING,
      defaultValue: 'General Creator'
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: 'India'
    },
    followers_count: {
      type: DataTypes.STRING,
      defaultValue: '0'
    },
    instagram_handle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: 'No bio added yet.'
    },
    // Explicitly adding avatar alias if DB uses it, to be safe, but focusing on user's schema
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  }, {
    tableName: 'users',
    timestamps: true,
    // Our DB uses snake_case timestamp columns (not createdAt/updatedAt)
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
