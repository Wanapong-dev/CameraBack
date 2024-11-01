const prisma = require("../config/prisma") 
const createError = require("../utils/createError") 
const jwt = require('jsonwebtoken') 


exports.authCheck = async (req, res, next) => {
    try {
        const headerToken = req.headers.authorization // ดึงโทเค็นจาก header ของ request
        
        if(!headerToken) {
            return createError(401, "No Token, Authorization") 
        }

        const token = headerToken.split(" ")[1] // แยกโทเค็นออกจาก header (ใช้รูปแบบ "Bearer [token]")

        const decode = jwt.verify(token, process.env.SECRET) // ตรวจสอบและถอดรหัสโทเค็นด้วย secret key
        req.user = decode // บันทึกข้อมูลผู้ใช้ที่ถอดรหัสได้ลงใน `req.user`

        const user = await prisma.user.findFirst({
            where: {
                email: req.user.email // ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้ email จากโทเค็นที่ถอดรหัส
            }
        })

        if(!user.enabled) {
            return createError(400, "This account cannot access") //
        }

        next() 
    } catch (err) {
       next(err) 
    }
}


exports.adminCheck = async (req, res, next) => {
    try {
        const { email } = req.user // ดึง email จาก `req.user` ที่ถอดรหัสได้จากโทเค็น
        console.log(email)

        const adminUser = await prisma.user.findFirst({
            where: {
                email: email // ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้ email
            }
        })
        if(!adminUser || adminUser.role !== 'admin') {
            return createError(403, "Forbidden") 
        }
        next() 
    } catch (err) {
        next(err) 
    }
}
