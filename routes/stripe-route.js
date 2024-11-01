const express = require("express");
const router = express.Router();
const  {getConfig, createPayment}  = require('../controllers/stripe-controller');
const { adminCheck, authCheck} = require('../middlewares/authCheck')


router.get('/config',authCheck, getConfig); 
router.post('/create-payment-intent',authCheck,  createPayment);

module.exports = router