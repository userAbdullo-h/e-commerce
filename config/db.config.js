const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('shop', 'root', 'o20h13', {
	host: 'localhost',
	dialect: 'mysql',
})

module.exports = sequelize
