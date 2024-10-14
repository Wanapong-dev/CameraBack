const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/category-controller')
const { authCheck,adminCheck } = require('../middlewares/authCheck')


router.post('/category',authCheck,adminCheck,categoryController.create)
router.get('/category',authCheck,adminCheck,categoryController.list)
router.delete('/category/:id',authCheck,adminCheck,categoryController.remove)

module.exports = router