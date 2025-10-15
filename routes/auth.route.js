const express = require('express')
const authController = require('../controllers/auth.controller')

const router = express.Router()

router.get('/login', authController.renderLogin)
router.post('/login', authController.login)

router.get('/register', authController.renderRegister)
router.post('/register', authController.register)

router.get('/verify/:verifyToken', authController.verify)

module.exports = router
