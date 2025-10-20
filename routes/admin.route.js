const express = require('express')
const adminController = require('../controllers/admin.controller')
const adminMiddleware = require('../middlewares/admin.middleware')
const upload = require('../utils/multer')
const router = express.Router()

router.get('/add-products', adminController.renderAddProducts)
router.post('/add-products', upload.single('myFile'), adminController.addProducts)

router.get('/products', adminController.renderProducts)

router.get('/edit-product/:id', adminController.renderEditProduct)
router.post('/edit-product/:id', upload.single('image'), adminController.editProduct)

router.post('/delete-product/:id', adminController.deleteProduct)

module.exports = router
