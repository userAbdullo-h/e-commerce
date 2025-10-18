const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		isVerified: { type: Boolean, default: false },
		verifyToken: { type: String },
		isAdmin: { type: Boolean, default: false },
	},
	{ timestamps: true }
)

module.exports = mongoose.model('user', userSchema)

// const { DataTypes } = require('sequelize')
// const sequelize = require('../config/db.config')

// module.exports = sequelize.define('User', {
// 	email: { type: DataTypes.STRING, unique: true, allowNull: false },
// })
