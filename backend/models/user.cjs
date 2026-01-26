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
    // Matches user's "profile_image" request, aliased to likely DB column or just added.
    // Given the "Zombie" context, I'll add BOTH current avatar and requested profile_image logic if possible, 
    // OR just use what the user provided. User provided `profile_image`. 
    // If DB has `avatar`, I should probably map it. 
    // But user snippet explicitly defines `profile_image`. 
    // I will include `profile_image` definition.
    // AND I will include `avatar` to be safe/compatible with existing DB content if it was populated there.
    profile_image: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'creator'
    },
    // 👇 THE CRITICAL NEW COLUMNS
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
    // Keeping avatar as it was present in previous file versions and likely holds data
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  }, {
    tableName: 'users', // Forces it to use the lowercase table
    timestamps: true
  });

  return User;
};
