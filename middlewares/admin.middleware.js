function adminMiddleware(req, res, next) {
	if (!req.session.user) {
		req.session.message = { type: 'danger', message: 'Please logging in.' }
		return res.redirect('/auth/login')
	}
	if (!req.session.user.isAdmin) {
		res.render('404')
	}
	next()
}

module.exports = adminMiddleware
