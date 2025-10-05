const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

module.exports = sequelize.define('Product', {
	title: { type: DataTypes.STRING, allowNull: false },
	price: { type: DataTypes.FLOAT, allowNull: false },
	image: { type: DataTypes.STRING, allowNull: false },
})
