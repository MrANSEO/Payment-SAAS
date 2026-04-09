const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'XAF'
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  operator: {
    type: DataTypes.ENUM('ORANGE', 'MTN'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },
  mesomb_transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  merchant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Merchants', key: 'id' }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['reference'] },
    { fields: ['customer_phone'] },
    { fields: ['status'] },
    { fields: ['merchant_id'] }
  ]
});

module.exports = Transaction;