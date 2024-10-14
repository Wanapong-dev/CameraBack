const prisma = require("../config/prisma")
const createError = require("../utils/createError")
const jwt = require('jsonwebtoken')

exports.authCheck = async (req,res,next) => {
    try {
        const headerToken = req.headers.authorization
       
        if(!headerToken) {
            return createError(401,"No Token, Authorization")
        }

        const token = headerToken.split(" ")[1]

        const decode = jwt.verify(token,process.env.SECRET)
        req.user = decode

        const user = await prisma.user.findFirst({
            where: {
                email : req.user.email
            }
        })

        if(!user.enabled) {
            return createError(400, "This account cannot access")
        }


        next()
    } catch (err) {
       next(err)
    }
}

exports.adminCheck = async (req,res,next) => {
    try {
        const { email } = req.user
        console.log(email)

        const adminUser = await prisma.user.findFirst({
            where : {
                email: email
            }
        })
        if(!adminUser || adminUser.role !== 'admin') {
            return createError(403,"Forbidden")
        }
        next()
    } catch (err) {
        next(err)
    }
}