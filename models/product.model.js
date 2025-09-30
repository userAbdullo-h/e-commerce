const fs = require('fs')
const path = require('path')

class ProductModel {
	constructor() {
		this.filePath = path.join(__dirname, '..', 'data', 'products.json')
	}

	getAll() {
		if (!fs.existsSync(this.filePath)) return []
		const data = fs.readFileSync(this.filePath, 'utf-8')
		return JSON.parse(data)
	}

	save(products) {
		// console.log('filePath:', this.filePath)
		console.log('products type:', typeof products)

		fs.writeFileSync(this.filePath, JSON.stringify(products, null, 2))
	}

	add(product) {
		const products = this.getAll()
		const id = global.crypto.randomUUID()
		products.push({ id, ...product })
		this.save(products)
	}

	findById(id) {
		const products = this.getAll()
		return products.find(c => c.id === id)
	}

	update(id, updatedProduct) {
		const products = this.getAll()
		const index = products.findIndex(c => c.id === id)
		if (index !== -1) {
			products[index] = { id, ...updatedProduct }
			this.save(products)
		}
	}

	remove(id) {
		const products = this.getAll().filter(c => c.id !== id)
		this.save(products)
	}
}

module.exports = new ProductModel()
