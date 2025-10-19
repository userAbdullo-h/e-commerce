function adminMiddleware(req, res, next) {
	if (!req.session.user || !req.session.user.isAdmin) {
		res.render('404')
	}
	next()
}

module.exports = adminMiddleware
