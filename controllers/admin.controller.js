const { productModel } = require('../models')

class AdminController {
	renderAddProduc(req, res) {
		res.render('admin/add-products', { title: 'Add products' })
	}

	async addProducts(req, res) {
		const { title, image, price } = req.body
		await productModel.create({ title, image, price })
		res.redirect('/admin/products')
	}

	async renderProducts(req, res) {
		const products = await productModel.findAll({ raw: true })
		res.render('admin/products', { title: 'Admin Products', products })
	}

	async renderEditProduct(req, res) {
		const product = await productModel.findByPk(req.params.id, { raw: true })
		res.render('admin/edit-product', { title: 'Edit Product', product })
	}

	async editProduct(req, res) {
		await productModel.update(req.body, { where: { id: req.params.id } })
		res.redirect('/admin/products')
	}

	async deleteProduct(req, res) {
		await productModel.destroy({ where: { id: req.params.id } })
		res.redirect('/admin/products')
	}
}

module.exports = new AdminController()
