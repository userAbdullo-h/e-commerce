const productModel = require('../models/product.model')

class AdminController {
	renderAddProduc(req, res) {
		res.render('admin/add-products', { title: 'Add products' })
	}

	async addProducts(req, res) {
		// const { title, image, price } = req.body
		await productModel.create(req.body)
		res.redirect('/admin/products')
	}

	async renderProducts(req, res) {
		const products = await productModel.find().lean()
		res.render('admin/products', { title: 'Admin Products', products })
	}

	async renderEditProduct(req, res) {
		const product = await productModel.findById(req.params.id).lean()
		res.render('admin/edit-product', { title: 'Edit Product', product })
	}

	async editProduct(req, res) {
		await productModel.findByIdAndUpdate(req.params.id, req.body)
		res.redirect('/admin/products')
	}

	async deleteProduct(req, res) {
		await productModel.findByIdAndDelete(req.params.id)
		res.redirect('/admin/products')
	}
}

module.exports = new AdminController()
