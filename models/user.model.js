const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		mobile: { type: String, required: true },
	},
	{ timestamps: true }
)

module.exports = mongoose.model('user', userSchema)

// const { DataTypes } = require('sequelize')
// const sequelize = require('../config/db.config')

// module.exports = sequelize.define('User', {
// 	email: { type: DataTypes.STRING, unique: true, allowNull: false },
// })
