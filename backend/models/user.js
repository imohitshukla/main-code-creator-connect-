'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone_otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'users'
  });

  User.associate = (models) => {
    // Define associations here
    User.hasOne(models.CreatorProfile, { foreignKey: 'user_id' });
    User.hasOne(models.BrandProfile, { foreignKey: 'user_id' });
  };

  return User;
};
