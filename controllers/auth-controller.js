const createError = require("../utils/createError")
const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req,res,next) => {
    try {
        const {email, password} = req.body


        // Validate Body
        if(!email) {
            return createError(400,"Email is require!!")
        }
        
        if(!password) {
            return createError(400,"Password is require!!")
        }
        
        // check email and password for DB
        const user = await prisma.user.findFirst({
            where: {
                email : email
            }
        })

        if(user) {
            return createError(400,"Email already exits")
        }

        // hashPassword
        const hashPassword = await bcrypt.hash(password,10)

        // create in DB
        await prisma.user.create({
            data:{
                email: email,
                password: hashPassword
            }
        })

        res.send('Register Success')
        
    } catch (err) {
     next(err)
    }
}


exports.login = async (req,res,next) => {
    try {

        const {email, password} = req.body

        // Check Email
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if(!user || !user.enabled) {
            return createError(400,"User Not found or not Enabled")
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return createError(400,"Password Invalid!!")
        }

        // Crate Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        // Generate Token
        jwt.sign(payload, process.env.SECRET,{
            expiresIn : '30d'
        },(err,token)=>{
            if(err){
                return createError(500,"Server Error")
            }
            res.json({ payload, token })
        })
    
        
    } catch (err) {
       next(err)
    }

}

exports.currentUser = async (req,res,next) => {
    try {

        const user = await prisma.user.findFirst({
            where : { email: req.user.email },
            select: {
                id:true,
                email : true,
                name : true,
                role : true
            }

        })
        res.send(user)
        
    } catch (err) {
        next(err)
    }

}


