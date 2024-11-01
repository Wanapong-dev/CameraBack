const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth-controller')
const { authCheck, adminCheck } = require('../middlewares/authCheck')






router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/current-user',authCheck,authController.currentUser) //ตรวจสออบสิทธืหน้าบ้าน
router.post('/current-admin',authCheck,adminCheck,authController.currentUser) //ตรวจสออบสิทธืหน้าบ้าน

module.exports = router