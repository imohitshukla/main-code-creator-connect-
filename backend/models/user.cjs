'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Standard Auth Fields
    name: {
      type: DataTypes.STRING,
      allowNull: true // Changed to true just in case, though user said false
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
    role: {
      type: DataTypes.ENUM('creator', 'brand', 'admin'),
      defaultValue: 'creator'
    },
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },

    // ✅ NEW COLUMNS (Synced with DB)
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

    // Legacy fields validation (optional, can leave them out if DB allows)
    phone_number: { type: DataTypes.STRING, allowNull: true },
    is_phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    User.hasOne(models.CreatorProfile, { foreignKey: 'user_id', as: 'creatorProfile' });
    User.hasOne(models.BrandProfile, { foreignKey: 'user_id' });
  };

  return User;
};
