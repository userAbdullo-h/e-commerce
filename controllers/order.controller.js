const TEST_USER_EMAIL = require('../config/const.config')
const cardModel = require('../models/card.model')
const orderModel = require('../models/order.model')
const userModel = require('../models/user.model')

class OrderController {
	async renderOrder(req, res) {
		const user = await userModel.findOne({ email: TEST_USER_EMAIL })
		const orders = await orderModel
			.find({ user: user._id })
			.populate('products.product')
			.lean()
		console.log(orders)

		res.render('order/user', { title: 'Orders', orders })
	}

	async placeOrder(req, res) {
		const user = await userModel.findOne({ email: TEST_USER_EMAIL })
		const card = await cardModel.findOne({ user: user._id }).populate({
			path: 'items',
			populate: { path: 'product', select: 'title price image' },
		})

		const orderProducts = card.items.map(item => ({
			product: item.product._id,
			quantity: item.quantity,
		}))
		const totalPrice = card.items.reduce((sum, item) => {
			return sum + item.product.price * item.quantity
		}, 0)

		await orderModel.create({
			user: user._id,
			products: orderProducts,
			totalPrice,
		})
		card.items = []
		await card.save()

		res.redirect('/orders')
	}
}

module.exports = new OrderController()
/////////////////////////////////////////////////////////////////////////////
