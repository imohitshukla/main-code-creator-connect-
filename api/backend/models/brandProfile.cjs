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
    
    // Company Identity
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    industry_vertical: {
      type: DataTypes.ENUM('E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 'Finance', 'Travel', 'Food & Beverage', 'Other'),
      allowNull: true
    },
    website_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    linkedin_page: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    
    // Business Details
    company_size: {
      type: DataTypes.ENUM('Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)'),
      allowNull: true
    },
    hq_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gst_tax_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Campaign Preferences (Matchmaking Data)
    typical_budget_range: {
      type: DataTypes.ENUM('₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+'),
      allowNull: true
    },
    looking_for: {
      type: DataTypes.JSON, // Multi-select: ['UGC', 'Instagram Reels', 'YouTube Integration', 'Affiliates', 'Blog Posts', 'TikTok Videos']
      allowNull: true
    },
    
    // Additional Info
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
