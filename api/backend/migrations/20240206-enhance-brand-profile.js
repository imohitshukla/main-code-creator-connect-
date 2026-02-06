'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop the old table if it exists
    await queryInterface.dropTable('brand_profiles');
    
    // Create the enhanced brand_profiles table
    await queryInterface.createTable('brand_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Company Identity
      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      industry_vertical: {
        type: Sequelize.ENUM('E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 'Finance', 'Travel', 'Food & Beverage', 'Other'),
        allowNull: true
      },
      website_url: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      linkedin_page: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      
      // Business Details
      company_size: {
        type: Sequelize.ENUM('Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)'),
        allowNull: true
      },
      hq_location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gst_tax_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      
      // Campaign Preferences (Matchmaking Data)
      typical_budget_range: {
        type: Sequelize.ENUM('₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+'),
        allowNull: true
      },
      looking_for: {
        type: Sequelize.JSON,
        allowNull: true
      },
      
      // Additional Info
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('brand_profiles');
  }
};
