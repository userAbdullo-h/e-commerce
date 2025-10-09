const TEST_USER_EMAIL = require('../config/const.config')
const cardModel = require('../models/card.model')
const productModel = require('../models/product.model')
const userModel = require('../models/user.model')

class ShopController {
	async renderHome(req, res) {
		const products = await productModel.find().lean()
		res.render('shop/home', { title: 'Shop', products })
	}

	async renderCart(req, res) {
		const user = await userModel.findOne({ email: TEST_USER_EMAIL })
		const card = await cardModel
			.findOne({ user: user._id })
			.select('user items')
			.populate({
				path: 'items',
				populate: {
					path: 'product',
					select: 'title price image',
				},
			})
			.lean()

		const filteredProduct = card.items.map(i => ({
			...i.product._doc,
			quantity: i.quantity,
			totalPrice: (i.product._doc.price * i.quantity).toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		}))
		console.log(card)
		res.render('shop/card', {
			title: 'Shopping card',
			products: filteredProduct,
		})
	}

	async addToCard(req, res) {
		const user = await userModel.findOne({ email: TEST_USER_EMAIL })
		const productId = req.params.id
		let card = await cardModel.findOne({ user: user._id })

		if (!card) {
			card = new cardModel({ user: user._id, items: [] })
		}

		const existingItem = card.items.find(
			i => i.product.toString() === productId
		)
		if (existingItem) {
			existingItem.quantity += 1
		} else {
			card.items.push({ product: productId, quantity: 1 })
		}

		await card.save()
		res.redirect('/card')
	}

	async updateCardItems(req, res) {
		const user = await userModel.findOne({ email: TEST_USER_EMAIL })
		const productId = req.params.id
		const { action } = req.body
		let card = await cardModel.findOne({ user: user._id })

		const item = card.items.find(i => i.product.toString() === productId)
		if (!item) return res.redirect('/card')

		if (action === 'increment') {
			item.quantity += 1
		} else if (action === 'decriment') {
			item.quantity = Math.max(1, item.quantity - 1)
		}

		await card.save()
		// if (item) {
		// 	item.quantity = parseInt(quantity)
		// 	await card.save()
		// }

		res.redirect('/card')
	}

	async deleteCard(req, res) {
		const user = await userModel.findOne({ email: TEST_USER_EMAIL })
		const productId = req.params.id
		let card = await cardModel.findOne({ user: user._id })

		card.items = card.items.filter(c => c.product.toString() !== productId)
		await card.save()

		res.redirect('/')
	}
}

module.exports = new ShopController()
