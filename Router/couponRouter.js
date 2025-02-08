const express = require('express');
const couponRouter = express.Router();
const {addCouponCode,deleteCoupon, viewCoupon,updateCoupon,couponValidation}  = require('../controllers/couponController')
const authorization = require('../middleware/auth')


couponRouter.post('/add-coupon', authorization, addCouponCode );
couponRouter.delete('/delete-coupon/:id', deleteCoupon);
couponRouter.get('/view-coupon/:id', viewCoupon);
couponRouter.put('/update-coupon/:id', updateCoupon);
couponRouter.post("/coupon/coupon-validation", couponValidation);


module.exports = couponRouter;