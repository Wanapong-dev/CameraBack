const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/category-controller')
const { authCheck,adminCheck } = require('../middlewares/authCheck')
const upload = require('../middlewares/upload')


router.post('/category',authCheck,adminCheck,upload.single('file'),categoryController.create) 
router.get('/category',categoryController.list)
router.delete('/category/:id',authCheck,adminCheck,categoryController.remove)

module.exports = router