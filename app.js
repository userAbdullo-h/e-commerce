require('dotenv').config()

const path = require('path')
const express = require('express')
const { engine } = require('express-handlebars')
const session = require('express-session')

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
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

//Routes
app.use(require('./routes/shop.route'))
app.use('/admin', require('./routes/admin.route'))

app.use((req, res) => {
	res.status(404).render('404', { title: '404 Not Found' })
})
const PORT = process.env.PORT

app.listen(PORT, () =>
	console.log(`Server is running on http://localhost${PORT}`)
)
