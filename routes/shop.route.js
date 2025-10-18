const express = require('express')
const shopController = require('../controllers/shop.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/', shopController.renderHome)

router.get('/card', authMiddleware, shopController.renderCart)
router.post('/card/:id', authMiddleware, shopController.addToCard)

router.post('/card/update/:id', authMiddleware, shopController.updateCardItems)

router.post('/card/delete/:id', authMiddleware, shopController.deleteCard)

module.exports = router
