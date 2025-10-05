const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

module.exports = sequelize.define('Card', {
	quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
})
