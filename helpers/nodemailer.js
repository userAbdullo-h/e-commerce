const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_NAME,
		pass: process.env.EMAIL_PASSWORD,
	},
})

module.exports = transporter
