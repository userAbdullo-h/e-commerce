const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_NAME,
		pass: process.env.EMAIL_PASSWORD,
	},
})

exports.sendVerificationEmail = (email, name, verifyLink) => {
	transporter.sendMail({
		from: 'UserA',
		to: email,
		subject: 'Email verification! ',
		html: ` 
				
	<body style="display: flex; justify-content: center; align-items: center;font-family: Helvetica,Arial,sans-serif;">
				<div style="width: 500px; height: 500px;">
				<h2 style="letter-spacing: 1px;"">E-commerce</h2>
				<hr>
				<h1 style="letter-spacing: 1px;line-height: 40px;">Verification link</h1>
				<p style="font-size: 23px; letter-spacing: 0.5px; margin-bottom: 30px">Hello ${name}</p>
				<p style="font-size: 17px; letter-spacing: 0.5px;">Please click the link below for verification:</p>
					<a style="font-size: 17px; letter-spacing: 0.5px;text-decoration: none;margin-top:20px;margin-bottom:20px;" href="${verifyLink}">Verify</a>
				<p style="font-size: 17px; letter-spacing: 0.5px;">If you didn't request this, please ignore this email for now.</p>
			</div>
	</body>								

			`,
	})
}

exports.sendOtpEmail = (email, name, otp) => {
	transporter.sendMail({
		from: 'UserA',
		to: email,
		subject: 'Email verification! ',
		html: ` 
				
	<body style="display: flex; justify-content: center; align-items: center;font-family: Helvetica,Arial,sans-serif;">

			<div style="width: 500px; height: 500px;">
				<h2 style="letter-spacing: 1px;"">E-commerce</h2>
				<hr>
				<h1 style="letter-spacing: 1px;line-height: 40px;">OTP Code</h1>
				<p style="font-size: 23px; letter-spacing: 0.5px; margin-bottom: 30px">Hello ${name}</p>
				<p style="font-size: 17px; letter-spacing: 0.5px;">Your OTP code is <strong>${otp}</strong></p>
				<p style="font-size: 17px; letter-spacing: 0.5px;">This code valid for only 10 minutes</p>
			</div>
	</body>								

			`,
	})
}
