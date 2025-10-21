const cardModel = require('../models/card.model')
const productModel = require('../models/product.model')

class ShopController {
	async renderHome(req, res) {
		const page = req.query.page || 1
		const limit = 6
		const skip = (page - 1) * limit

		const [products, countProducts] = await Promise.all([
			productModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			productModel.countDocuments(),
		])

		const totalPages = Math.max(Math.ceil(countProducts / limit), 1)

		res.render('shop/home', { title: 'Shop', products, totalPages, currentPage: page })
	}

	async renderCart(req, res) {
		const user = req.session.user
		const card = await cardModel.findOne({ user: user._id }).populate('items.product').lean()

		if (card === null) {
			return res.render('shop/card', {
				title: 'Shopping card',
				products: [],
			})
		}

		const filteredProduct = card.items.map(i => ({
			...i.product,
			quantity: i.quantity,
			totalPrice: (i.product.price * i.quantity).toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		}))

		const totalPrice = filteredProduct.reduce((sum, item) => {
			return sum + item.price * item.quantity
		}, 0)
		res.render('shop/card', {
			title: 'Shopping card',
			products: filteredProduct,
			totalPrice: totalPrice.toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		})
	}

	async addToCard(req, res) {
		const user = req.session.user
		const productId = req.params.id
		let card = await cardModel.findOne({ user: user._id })

		if (!card) {
			card = new cardModel({ user: user._id, items: [] })
		}

		const existingItem = card.items.find(i => i.product.toString() === productId)
		if (existingItem) {
			existingItem.quantity += 1
		} else {
			card.items.push({ product: productId, quantity: 1 })
		}

		await card.save()
		req.session.alert = {
			type: 'info',
			message: 'Added to card',
		}
		res.redirect('/card')
	}

	async updateCardItems(req, res) {
		const user = req.session.user
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
		const user = req.session.user
		const productId = req.params.id
		let card = await cardModel.findOne({ user: user._id })

		card.items = card.items.filter(c => c.product.toString() !== productId)
		await card.save()

		req.session.alert = {
			type: 'info',
			message: 'Card deleted',
		}
		res.redirect('/')
	}
}

module.exports = new ShopController()
