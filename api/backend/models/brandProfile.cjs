'use strict';
module.exports = (sequelize, DataTypes) => {
  const BrandProfile = sequelize.define('BrandProfile', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company_size: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'brand_profiles'
  });

  BrandProfile.associate = (models) => {
    BrandProfile.belongsTo(models.User, { foreignKey: 'user_id' });
    BrandProfile.hasMany(models.Campaign, { foreignKey: 'brand_id' });
  };

  return BrandProfile;
};
