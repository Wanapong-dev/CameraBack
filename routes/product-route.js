const express = require('express')
const router = express.Router()
const productController = require('../controllers/product-controller')



router.post('/product',productController.create )
router.get('/product/:count',productController.list )
router.put('/product/:id',productController.update)
router.get('/product/:id',productController.read)
router.delete('/product/:id',productController.remove)
router.post('/productby',productController.listby)
router.post('/search/filters',productController.searchFilters)



module.exports = router