const cardModel = require('../models/card.model')
const productModel = require('../models/product.model')

class ShopController {
	renderHome(req, res) {
		const products = productModel.getAll()
		res.render('shop/home', { title: 'Shop', products })
	}

	renderCart(req, res) {
		const card = cardModel.getCard()
		res.render('shop/card', { title: 'Shopping card', card })
	}

	addToCard(req, res) {
		const product = productModel.findById(req.params.id)
		cardModel.addToCard(product)
		res.redirect('/card')
	}

	deleteCard(req, res) {
		cardModel.removeFromCard(req.params.id)
		res.redirect('/')
	}
}

module.exports = new ShopController()
