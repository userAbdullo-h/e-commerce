const { productModel, userModel } = require('../models')
const cardModel = require('../models/card.model')
const TEST_USER_EMAIL = require('../config/const.config')

class ShopController {
	async renderHome(req, res) {
		const products = await productModel.findAll({ raw: true })
		res.render('shop/home', { title: 'Shop', products })
	}

	async renderCart(req, res) {
		const user = await userModel.findOne({ where: { email: TEST_USER_EMAIL } })
		const products = await user.getCardProducts({ raw: true })
		const filteredProduct = products.map(p => ({
			...p,
			quantity: p['Card.quantity'],
		}))

		res.render('shop/card', {
			title: 'Shopping card',
			products: filteredProduct,
		})

		// const card = cardModel.getCard()
		// res.render('shop/card', { title: 'Shopping card', card })
	}

	async addToCard(req, res) {
		const user = await userModel.findOne({ where: { email: TEST_USER_EMAIL } })
		const product = await productModel.findByPk(req.params.id)

		const existing = await user.getCardProducts({
			where: { id: product.id },
		})
		if (existing.length > 0) {
			let item = existing[0]
			item.Card.quantity += 1
			await item.Card.save()
		} else {
			await user.addCardProduct(product, { through: { quantity: 1 } })
		}

		res.redirect('/card')

		// const product = await productModel.findById(req.params.id)
		// cardModel.addToCard(product)
		// res.redirect('/card')
	}

	async deleteCard(req, res) {
		const user = await userModel.findOne({ where: { email: TEST_USER_EMAIL } })
		await user.removeCardProduct(req.params.id)
		res.redirect('/')
	}
}

module.exports = new ShopController()
