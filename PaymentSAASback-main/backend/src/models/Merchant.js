const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Si BD non disponible, créer un mock
let Merchant = null;

if (sequelize) {
  Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    webhook_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    api_key: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (merchant) => {
        if (merchant.password) {
          merchant.password = await bcrypt.hash(merchant.password, 12);
        }
        if (!merchant.api_key) {
          merchant.api_key = `pk_${crypto.randomBytes(24).toString('hex')}`;
        }
      },
      beforeUpdate: async (merchant) => {
        if (merchant.changed('password')) {
          merchant.password = await bcrypt.hash(merchant.password, 12);
        }
      }
    }
  });
} else {
  // Mock Merchant quand BD non disponible
  console.warn('⚠️ Sequelize non initialisé - Mode sans BD pour Merchant');
  Merchant = {
    findOne: async () => null,
    findByPk: async () => null,
    create: async (data) => {
      throw new Error('BD non disponible');
    },
    findAll: async () => []
  };
}

module.exports = Merchant;