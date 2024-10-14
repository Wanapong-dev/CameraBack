const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const { authCheck, adminCheck } = require('../middlewares/authCheck')


router.get('/users',authCheck,adminCheck,userController.listUsers)
router.post('/change-status',authCheck,adminCheck,userController.changeStatus)
router.post('/change-role',authCheck,adminCheck,userController.changeRole)

router.post('/user/cart',authCheck,userController.userCart)
router.get('/user/cart',authCheck,userController.getUserCart)
router.delete('/user/cart',authCheck,userController.emptyCart)

router.post('/user/address',authCheck,userController.saveAddress)

router.post('/user/order',authCheck,userController.saveOrder)
router.get('/user/order',authCheck,userController.getOrder)

module.exports = router