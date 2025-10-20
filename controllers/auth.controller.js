const bcrypt = require('bcrypt')
const userModel = require('../models/user.model')
const { signReset, verifyReset } = require('../utils/jwt')
const { sendVerificationEmail, sendOtpEmail } = require('../helpers/nodemailer')
const otpModel = require('../models/otp.model')

class authController {
	// RenderLogin
	renderLogin(req, res) {
		res.render('auth/login', { title: 'Login' })
	}

	// Login
	async login(req, res) {
		const { email, password } = req.body
		const user = await userModel.findOne({ email })
		if (!user) {
			req.session.alert = {
				type: 'danger',
				message: 'User not found',
			}
			return res.redirect('/auth/login')
		}

		if (!user.isVerified) {
			req.session.alert = {
				type: 'danger',
				message: 'Email is not verified',
			}
			return res.redirect('/auth/login')
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			req.session.alert = {
				type: 'danger',
				message: 'Password is incorrect',
			}
			return res.redirect('/auth/login')
		}

		req.session.user = user
		res.redirect('/auth/login-back')
	}

	// LoginBack
	loginBack(req, res) {
		const user = req.session.user.name

		req.session.alert = {
			type: 'success',
			message: `Welcome ${user}`,
		}
		res.redirect('/')
	}

	// RenderRegister
	renderRegister(req, res) {
		res.render('auth/register', { title: 'Register' })
	}

	// Register
	async register(req, res) {
		const { email, password, name } = req.body

		const exist = await userModel.findOne({ email })
		if (exist) {
			req.session.alert = {
				type: 'danger',
				message: 'User already exist',
			}
			return res.redirect('/auth/register')
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const createdUser = await userModel.create({
			email: email.trim().toLowerCase(),
			password: hashedPassword,
			name,
		})

		const verifyToken = signReset({ userId: createdUser._id })

		const verifyLink = `${process.env.DOMAIN}/auth/verify/${verifyToken}`
		await sendVerificationEmail(email, name, verifyLink)

		req.session.alert = {
			type: 'success',
			message: 'Verification link was send! Please verify your accaunt',
		}
		res.redirect('/auth/login')
	}

	// LogOut
	logout(req, res) {
		req.session.destroy(() => {
			res.redirect('/auth/logged-out')
		})
	}

	// LoggedOut
	loggedOut(req, res) {
		req.session.alert = {
			type: 'success',
			message: 'Logged out successfully',
		}
		res.redirect('/auth/login')
	}

	// Verify
	async verify(req, res) {
		const decoded = verifyReset(req.params.verifyToken)
		if (!decoded) {
			return res.render('auth/verify', {
				succes: false,
				message: 'Invalid or expired link. Please try again',
			})
		}
		const user = await userModel.findById(decoded.userId)
		if (!user) {
			return res.render('auth/verify', {
				succes: false,
				message: 'Invalid or expired link. Please try again',
			})
		}

		user.isVerified = true

		await user.save()
		return res.render('auth/verify', {
			succes: true,
			message:
				'Your account has been successfully verified. Now you can login!',
		})
	}

	// RenderForgotPassword
	renderForgotPassword(req, res) {
		res.render('auth/forgot-password', { title: 'Forgot password' })
	}

	// SendOTP
	async sendOTP(req, res) {
		const email = req.body.email.trim().toLowerCase()

		if (!email) {
			req.session.alert = { type: 'danger', message: 'Email is required' }
			return res.redirect('/auth/forgot-password')
		}

		const user = await userModel.findOne({ email })

		if (!user) {
			req.session.alert = { type: 'danger', message: 'User not found' }
			return res.redirect('/auth/forgot-password')
		}

		const existingOtp = await otpModel
			.findOne({ user: user._id })
			.sort({ createdAt: -1 })

		console.log(existingOtp)

		if (
			existingOtp &&
			Date.now() - existingOtp.otpLastSent.getTime() < 60 * 1000
		) {
			req.session.alert = {
				type: 'warning',
				message:
					'An OTP was already sent recently. Please wait 1 minute before requesting a new one',
			}
			return res.redirect('/auth/forgot-password')
		}

		req.session.alert = {
			type: 'success',
			message: 'OTP has been sent to your email. Please check your inbox',
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString() //Generate 6-digit code
		const hash = await bcrypt.hash(otp, 10)

		const otpData = {
			user: user._id,
			otpHash: hash,
			otpTires: 0,
			otpLastSent: new Date(),
			otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
		}

		await otpModel.create(otpData)
		await sendOtpEmail(email, user.name, otp)

		req.session.uid = user._id
		res.redirect(`/auth/verify-otp`)
	}

	// RenderVerifyOTP
	renderVerifyOtp(req, res) {
		const userId = req.session.uid
		if (!userId) {
			req.session.alert = {
				type: 'danger',
				message: 'Session expired. Please try again',
			}
		}
		res.render(`auth/verify-otp`, { title: 'Verify OTP' })
	}

	// VerifyOtp
	async verifyOtp(req, res) {
		const userId = req.session.uid
		if (!userId) {
			req.session.alert = {
				type: 'danger',
				message: 'Session expired. Please try again',
			}
			res.redirect('/auth/forgot-password')
		}

		const otp = req.body.otp.trim()

		if (!otp) {
			req.session.alert = {
				type: 'danger',
				message: 'OTP is required',
			}
			res.redirect('/auth/verify-otp')
		}

		const user = await userModel.findById(userId)

		if (!user) {
			req.session.alert = {
				type: 'danger',
				message: 'User is not defined',
			}
			res.redirect('/auth/forgot-password')
		}

		const otpData = await otpModel
			.findOne({ user: userId })
			.sort({ createdAt: -1 })
		if (!otpData) {
			req.session.alert = {
				type: 'danger',
				message: 'No OTP found for this user',
			}
			res.redirect('/auth/forgot-password')
		}

		if (otpData.otpExpiresAt < new Date()) {
			await otpModel.deleteMany({ user: userId })
			req.session.alert = {
				type: 'danger',
				message: 'OTP has expired. Please request new one',
			}
			res.redirect('/auth/forgot-password')
		}

		const isMatch = await bcrypt.compare(otp, otpData.otpHash)

		if (!isMatch) {
			otpData.otpTires += 1
			await otpData.save()

			if (otpData.otpTires >= 3) {
				await otpModel.deleteMany({ user: userId })
				req.session.alert = {
					type: 'danger',
					message: 'Too many attemps, please request new OTP',
				}
				res.redirect('/auth/forgot-password')
			}

			req.session.alert = {
				type: 'danger',
				message: 'Invalid OTP. Please try again',
			}
			return res.redirect('/auth/verify-otp')
		}

		await otpModel.deleteMany({ user: userId })
		req.session.alert = {
			type: 'success',
			message: 'OTP verified successfully. You can now reset your passpword',
		}
		res.redirect(`/auth/reset-password`)
	}

	// RenderResetPassword
	renderResetPassword(req, res) {
		const userId = req.session.uid
		if (!userId) {
			req.session.alert = {
				type: 'danger',
				message: 'Session expired. Please try again',
			}
		}
		res.render('auth/reset-password', { title: 'Reset password' })
	}

	// ResetPassword
	async resetPassword(req, res) {
		const userId = req.session.uid
		if (!userId) {
			req.session.alert = {
				type: 'danger',
				message: 'Session expired. Please try again',
			}
			return res.redirect('/auth/forgot-password')
		}

		const { password, confirmPassword } = req.body
		if (!password || !confirmPassword) {
			req.session.alert = {
				type: 'danger',
				message: 'All fields are required',
			}
			return res.redirect('/auth/reset-password')
		}

		if (password !== confirmPassword) {
			req.session.alert = {
				type: 'danger',
				message: 'Passwords do not match',
			}
			return res.redirect('/auth/reset-password')
		}

		const user = await userModel.findById(userId)

		if (!user) {
			req.session.alert = {
				type: 'danger',
				message: 'User is not defined',
			}
			return res.redirect('/auth/forgot-password')
		}

		user.password = await bcrypt.hash(password, 10)
		await user.save()

		req.session.alert = {
			type: 'success',
			message: 'Password reset successfully. Now you can log in',
		}
		req.session.destroy(() => {
			res.redirect('/auth/login')
		})
	}
}

module.exports = new authController()
