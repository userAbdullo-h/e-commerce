const sequelize = require('../config/db.config')

const userModel = require('./user.model')
const productModel = require('./product.model')
const cardModel = require('./card.model')

userModel.belongsToMany(productModel, {
	through: cardModel,
	as: 'CardProducts',
})
productModel.belongsToMany(userModel, { through: cardModel })

module.exports = { sequelize, userModel, productModel, cardModel }
