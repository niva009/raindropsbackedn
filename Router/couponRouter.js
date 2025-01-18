const express = require('express');
const couponRouter = express.Router();
const {addCouponCode,deleteCoupon, viewCoupon,updateCoupon,couponValidation}  = require('../controllers/couponController')

couponRouter.post('/add-coupon', addCouponCode );
couponRouter.delete('/delete-coupon/:id', deleteCoupon);
couponRouter.get('/view-coupon', viewCoupon);
couponRouter.put('/update-coupon/:id', updateCoupon);
couponRouter.post("/coupon/coupon-validation", couponValidation);


module.exports = couponRouter;