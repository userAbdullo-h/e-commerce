require('dotenv').config()

const path = require('path')
const express = require('express')
const { engine } = require('express-handlebars')
const session = require('express-session')
const mongoose = require('mongoose')
const hbsHelper = require('./helpers/hbs')
const adminMiddleware = require('./middlewares/admin.middleware')
const authMiddleware = require('./middlewares/auth.middleware')
const AppError = require('./utils/error')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

// Middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
	session({
		secret: process.env.SECRET_KEY,
		resave: false,
		saveUninitialized: true,
	})
)

//Views Engine
app.engine('handlebars', engine({ helpers: hbsHelper }))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

app.use((req, res, next) => {
	res.locals.alert = req.session.alert
	res.locals.user = req.session.user
	delete req.session.alert
	next()
})

//Routes
app.use(require('./routes/shop.route'))
app.use('/admin', adminMiddleware, require('./routes/admin.route'))
app.use('/orders', authMiddleware, require('./routes/order.route'))
app.use('/auth', require('./routes/auth.route'))

app.use((req, res, next) => {
	next(new AppError('page not found', 404))
})

app.use(errorMiddleware)

async function startApp() {
	try {
		mongoose.connect(process.env.MONGO_URI)
		console.log('Db connected')

		const PORT = process.env.PORT
		app.listen(PORT, () =>
			console.log(`Server is running on http://localhost${PORT}`)
		)
	} catch (error) {
		console.log(`Error: ${error}`)
	}
}
startApp()
