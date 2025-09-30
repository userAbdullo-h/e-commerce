const fs = require('fs')
const path = require('path')

class CardModel {
	constructor() {
		this.filePath = path.join(__dirname, '..', 'data', 'cart.json')
	}

	getCardData() {
		if (!fs.existsSync(this.filePath)) return { items: [] }
		const data = fs.readFileSync(this.filePath)
		return JSON.parse(data)
	}

	saveCard(card) {
		fs.writeFileSync(this.filePath, JSON.stringify(card, null, 2))
	}

	getCard() {
		return this.getCardData()
	}

	addToCard(product) {
		const card = this.getCardData()
		const existing = card.items.find(item => item.id === product.id)

		if (existing) {
			existing.amount++
		} else {
			card.items.push({ ...product, amount: 1 })
		}

		this.saveCard(card)
	}

	removeFromCard(id) {
		const card = this.getCardData()
		card.items = card.items.filter(item => item.id !== id)
		this.saveCard(card)
	}
}

module.exports = new CardModel()
