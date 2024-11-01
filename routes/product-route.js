const express = require('express')
const router = express.Router()
const productController = require('../controllers/product-controller')
const { adminCheck,authCheck} = require('../middlewares/authCheck')


router.post('/product',productController.create )
router.get('/products/:count',productController.list )
router.put('/product/:id',productController.update)
router.get('/product/:id',productController.read)
router.delete('/product/:id',productController.remove)
router.post('/productby',productController.listby) //เรียงลำดับสินค้า
router.post('/search/filters',productController.searchFilters)


router.post('/images',authCheck,adminCheck,productController.createImages) //สร้างรูปภาพ
router.post('/removeimages',authCheck,adminCheck,productController.removeImage) //ลบภาพ




module.exports = router