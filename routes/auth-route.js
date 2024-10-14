const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth-controller')
const { authCheck, adminCheck } = require('../middlewares/authCheck')






router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/current-user',authCheck,authController.currentUser)
router.post('/current-admin',authCheck,adminCheck,authController.currentUser)

module.exports = router