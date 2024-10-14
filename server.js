const express = require('express')
const morgan = require('morgan')
const { readdirSync } = require('fs')

const cors =require('cors')
const errorHandler = require('./middlewares/error')
// const authRouter =require('./routes/auth-route')
// const categoryRouter = require('./routes/category-route')
const app = express()

// middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())




readdirSync('./routes')
.map((c)=> app.use('/api', require('./routes/'+c)))
// Router
// app.use('/api',authRouter)
// app.use('/api',categoryRouter)

app.use(errorHandler)

app.listen(8000, ()=> console.log('Server is running on port 8000'))