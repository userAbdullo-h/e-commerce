const productModel = require('../models/product.model')

class AdminController {
	renderAddProducts(req, res) {
		res.render('admin/add-products', { title: 'Add products' })
	}

	async addProducts(req, res) {
		await productModel.create({ ...req.body, image: req.file.filename })
		req.session.alert = { type: 'success', message: 'Product added successfully' }
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
		let image
		if (req.file) {
			image = req.file.filename
		}

		await productModel.findByIdAndUpdate(req.params.id, { ...req.body, image })
		req.session.alert = { type: 'success', message: 'Product updated successfuly' }
		res.redirect('/admin/products')
	}

	async deleteProduct(req, res) {
		await productModel.findByIdAndDelete(req.params.id)
		req.session.alert = { type: 'success', message: 'Product deleted successfully' }
		res.redirect('/admin/products')
	}
}

module.exports = new AdminController()
