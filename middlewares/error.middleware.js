const errorMiddleware = (error, req, res, next) => {
	const message = error.message
	const statusCode = error.statusCode || 500

	return res.render('error', { statusCode, message })
}

module.exports = errorMiddleware
