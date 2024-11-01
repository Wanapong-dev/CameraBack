require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { readdirSync } = require('fs')

const cors =require('cors')
const errorHandler = require('./middlewares/error')

const app = express()

// middleware
app.use(morgan('dev'))
app.use(express.json({limit:'20mb'}))
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], //ถ้าไม่กำหนด GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD จะเป็นdefault
    credentials: true, // อนุญาตให้ส่ง cookies หรือข้อมูลการยืนยันตัวตนในคำร้องขอได้ (เช่น session หรือ JWT token)
}));


readdirSync('./routes')
.map((c)=> app.use('/api', require('./routes/'+c)))

app.use(errorHandler)

app.listen(8000, ()=> console.log('Server is running on port 8000'))