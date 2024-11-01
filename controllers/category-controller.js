const createError = require("../utils/createError")
const prisma = require('../config/prisma')
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })


// ฟังก์ชันสำหรับสร้างหมวดหมู่ใหม่ (Category)
exports.create = async (req, res, next) => {
    try {
        const { name } = req.body; 
        const upload = await cloudinary.uploader.upload(req.file.path); // อัพโหลดรูปภาพไปยัง Cloudinary
        const photo = upload.secure_url; // เก็บ URL ของรูปภาพที่อัพโหลดสำเร็จ
        const category = await prisma.category.create({
            data: {
                name: name,      
                imageurl: photo  
            }
        });

        res.send(category);  // ส่งข้อมูลหมวดหมู่ที่สร้างกลับไปยัง client
    } catch (err) {
        
        next(err);
    }
};

// ฟังก์ชันสำหรับแสดงรายการหมวดหมู่ทั้งหมด (Category)
exports.list = async (req, res, next) => {
    try {
        const category = await prisma.category.findMany(); // ค้นหาหมวดหมู่ทั้งหมดจากฐานข้อมูล
        res.send(category); // ส่งข้อมูลหมวดหมู่ทั้งหมดกลับไปยัง client
    } catch (err) {
        
        next(err);
    }
};

// ฟังก์ชันสำหรับลบหมวดหมู่ (Category)
exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params; // ดึงค่า id ของหมวดหมู่จากพารามิเตอร์ของ URL
        const category = await prisma.category.delete({
            where: {
                id: +id // ลบหมวดหมู่ตาม id
            }
        });

        res.send(category);
    } catch (err) {
      
        next(err);
    }
};