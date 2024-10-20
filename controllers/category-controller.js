const createError = require("../utils/createError")
const prisma = require('../config/prisma')
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })


exports.create = async (req,res,next) =>{
    try {
        const {name} = req.body
        const upload = await cloudinary.uploader.upload(req.file.path)
        const photo = upload.secure_url
        const category = await prisma.category.create({
                data: {
                    name : name,
                    imageurl: photo
                }
        })
       
        res.send(category)
    } catch (err) {
        next(err)
    }
}

exports.list = async (req,res,next) =>{ 
    try {
        const category = await prisma.category.findMany()
        res.send(category)
    } catch (err) {
        next(err)
    }
}

exports.remove = async (req,res) =>{
    try {

        const { id } = req.params
        const category = await prisma.category.delete({
            where:{
                id: +id
            }
        }) 
        res.send(category)
    } catch (err) {
        next(err)
    }
}