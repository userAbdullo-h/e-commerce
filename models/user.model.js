const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

module.exports = sequelize.define('User', {
	email: { type: DataTypes.STRING, unique: true, allowNull: false },
})
