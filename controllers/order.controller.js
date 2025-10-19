const cardModel = require('../models/card.model')
const orderModel = require('../models/order.model')

class OrderController {
	async renderOrder(req, res) {
		const user = req.session.user
		const orders = await orderModel
			.find({ user: user._id })
			.populate('products.product')
			.lean()
		console.log(orders)

		res.render('order/user', { title: 'Orders', orders })
	}

	async placeOrder(req, res) {
		const user = req.session.user
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

		req.session.alert = {
			type: 'info',
			message: 'Ordered',
		}

		res.redirect('/orders')
	}
}

module.exports = new OrderController()
/////////////////////////////////////////////////////////////////////////////
