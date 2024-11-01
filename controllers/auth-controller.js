const createError = require("../utils/createError")
const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body; 

       
        if (!email) {
            return createError(400, "Email is required!!"); 
        }

        if (!password) {
            return createError(400, "Password is required!!"); 
        }

        // ตรวจสอบว่า email นั้นมีอยู่ในฐานข้อมูลหรือยัง
        const user = await prisma.user.findFirst({
            where: {
                email: email 
            }
        });

        // หากมีผู้ใช้ที่ใช้ email นี้อยู่แล้ว
        if (user) {
            return createError(400, "Email already exists"); 
        }

        // แฮช (hash) รหัสผ่านด้วย bcrypt
        const hashPassword = await bcrypt.hash(password, 10); // แฮชรหัสผ่าน

        // สร้างผู้ใช้ใหม่ในฐานข้อมูล
        await prisma.user.create({
            data: {
                email: email,           
                password: hashPassword  
            }
        });

      
        res.send('Register Success');

    } catch (err) {
        next(err);
    }
}


exports.login = async (req, res, next) => {
    try {

        const { email, password } = req.body; 

        // ตรวจสอบว่า email มีอยู่ในฐานข้อมูลหรือไม่
        const user = await prisma.user.findFirst({
            where: {
                email: email 
            }
        });

        // หากไม่พบผู้ใช้หรือผู้ใช้ถูกปิดการใช้งาน (enabled: false)
        if (!user || !user.enabled) {
            return createError(400, "User Not found or not Enabled"); 
        }

        // ตรวจสอบความถูกต้องของรหัสผ่านที่ผู้ใช้กรอกมา
        const isMatch = await bcrypt.compare(password, user.password); // เปรียบเทียบรหัสผ่านที่กรอกกับที่เก็บในฐานข้อมูล
        if (!isMatch) {
            return createError(400, "Password Invalid!!"); 
        }

        // สร้างข้อมูล Payload สำหรับการสร้าง Token
        const payload = {
            id: user.id,      
            email: user.email, 
            role: user.role,   
            name: user.name,   
            address: user.address 
        };

        // สร้าง JWT Token โดยใช้ข้อมูล payload และ secret key ที่เก็บในไฟล์ .env
        jwt.sign(payload, process.env.SECRET, {
            expiresIn: '30d' // กำหนดอายุของ Token เป็น 30 วัน
        }, (err, token) => { // callback function ที่จะถูกเรียกเมื่อสร้าง token เสร็จ
            if (err) {
                return createError(500, "Server Error"); 
            }
            res.json({ payload, token }); // ส่งข้อมูล payload และ token กลับไปยัง client
        });

    } catch (err) {
        next(err);
    }

};

exports.currentUser = async (req,res,next) => {
    try {
        // ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้อีเมลของผู้ใช้ที่เข้าสู่ระบบ
        const user = await prisma.user.findFirst({
            where : { email: req.user.email }, // ค้นหาผู้ใช้ที่มีอีเมลตรงกับใน req.user.email
            select: {
                id:true,      
                email : true, 
                name : true,  
                role : true,  
                address : true 
            }
        })

       
        console.log("checkuser",user) 
        res.send(user) // ส่งข้อมูลผู้ใช้ที่ค้นหาได้กลับไปยัง client
        
    } catch (err) {
        next(err)
    }
}


