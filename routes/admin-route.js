const express = require('express')
const { authCheck } = require('../middlewares/authCheck')
const router = express.Router()
const adminController = require('../controllers/admin-controller')

router.put('/admin/order-status',authCheck,adminController.changeOrderStatus) //อัพเดทสถานะออเดอร์ 
router.get('/admin/orders',authCheck,adminController.getOrderAdmin) //ดูออเดอร์


module.exports = router