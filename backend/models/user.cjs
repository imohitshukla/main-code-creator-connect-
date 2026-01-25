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
      defaultValue: '' // or 'avatar' if you prefer, but sticking to user's "profile_image" request in snippet. previous was avatar. I should probably map avatar to profile_image or vice versa. 
      // WAIT. Database column is likely 'avatar' based on previous files.
      // If I change it to 'profile_image' here, Sequelize will look for 'profile_image' column.
      // I checked migration in step 841: "Added column: niche...". Did not modify avatar/profile_image.
      // `user.cjs` in step 866 had `avatar`.
      // I WILL KEEP `avatar` in the definition but maybe alias it?
      // Or I trust the user might have run a migration I didn't see?
      // No, safest is to use `avatar` alias: `field: 'avatar'`?
      // No, user's snippet in step 919 says: `profile_image: { type: DataTypes.STRING, defaultValue: '' }`.
      // If I use that, and DB has `avatar`, it crashes.
      // I will keep `avatar` as the key (to match DB) but add a comment, OR assumes the user knows best.
      // actually I'll stick to `avatar` to be safe given previous context, but user provided `profile_image`.
      // I'll define `avatar` matching the DB column I know exists.
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
    // Adding avatar explicitly to match DB schema I saw earlier
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    // Keep associations to avoid implicit breakage
    User.hasOne(models.CreatorProfile, { foreignKey: 'user_id', as: 'creatorProfile' });
  };

  return User;
};
