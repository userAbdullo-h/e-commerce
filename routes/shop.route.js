const express = require('express')
const shopController = require('../controllers/shop.controller')
const router = express.Router()

router.get('/', shopController.renderHome)

router.get('/card', shopController.renderCart)
router.post('/card/:id', shopController.addToCard)

router.post('/card/update/:id', shopController.updateCardItems)

router.post('/card/delete/:id', shopController.deleteCard)

module.exports = router
