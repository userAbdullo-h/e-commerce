const bcrypt = require('bcrypt')
const userModel = require('../models/user.model')
const transporter = require('../helpers/nodemailer')

class authController {
	renderLogin(req, res) {
		res.render('auth/login', { title: 'Login' })
	}

	async login(req, res) {
		const { email, password } = req.body
		const user = await userModel.findOne({ email })
		if (!user) {
			req.session.message = {
				type: 'danger',
				message: 'User not found',
			}
			res.redirect('/auth/login')
		}

		if (!user.isVerified) {
			req.session.message = {
				type: 'danger',
				message: 'Email is not verified',
			}
			res.redirect('/auth/login')
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			req.session.message = {
				type: 'danger',
				message: 'Password is incorrect',
			}
			res.redirect('/auth/login')
		}

		req.session.user = user
		res.redirect('/')
	}

	renderRegister(req, res) {
		res.render('auth/register', { title: 'Register' })
	}

	async register(req, res) {
		const { email, password, name } = req.body

		const exist = await userModel.findOne({ email })
		if (exist) {
			req.session.message = {
				type: 'danger',
				message: 'User already exist',
			}
			res.redirect('/auth/register')
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const verifyToken = crypto.randomUUID().toString('hex')

		await userModel.create({
			email,
			password: hashedPassword,
			verifyToken,
			name,
		})

		const verifyLink = `${process.env.DOMAIN}/auth/verify/${verifyToken}`
		await transporter.sendMail({
			from: 'UserA',
			to: email,
			subject: 'Email verification! ',
			html: ` 
				<h1>Hello ${name}</h1>
				<h3 style="color:#a3a3c2">Please click the link below for verification:</h3>
				<a class="" href='${verifyLink}'>Verify</a>									

			`,
		})

		req.session.message = {
			type: 'success',
			message: 'Verification link was send! Please verify your accaunt',
		}
		res.redirect('/auth/login')
	}

	async verify(req, res) {
		const user = await userModel.findOne({
			verifyToken: req.params.verifyToken,
		})
		if (!user) {
			res.send('User not found')
		}

		user.isVerified = true
		user.verifyToken = undefined

		await user.save()
		res.render('auth/verified')
	}
}

module.exports = new authController()
