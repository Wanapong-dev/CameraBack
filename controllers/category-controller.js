const createError = require("../utils/createError")
const prisma = require('../config/prisma')

exports.create = async (req,res,next) =>{
    try {
        const {name} = req.body
        
        const category = await prisma.category.create({
                data: {
                    name : name
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