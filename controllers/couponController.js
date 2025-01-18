const couponSchema = require('../models/couponSchema');
const activatedCoupon = require('../models/activatedCoupon')
const cartproducts = require('../models/cartSchema');


const addCouponCode = async(req, res) =>{

    try {
         
        const { couponCode, discountType, description, isActive, expireDate, couponNumbers, cartAmount} = req.body;

        console.log(req.body);

        const duplicatecouponCode = await couponSchema.findOne({couponCode: couponCode})

        if(duplicatecouponCode){
            return res.status(409).json({
                message:"coupon already exist",
                success: false,
                error: true,

            })
        }

        if(!couponCode || !discountType ){

            return res.status(400).json({
                message:"all the fields are required",
                error: true,
                success: false,
            })

        }

        const couponData = new couponSchema({
            couponCode,
            discountType,
            description,
            isActive,
            expireDate,
            cartAmount,
            couponNumbers
        })

        await couponData.save();

        if(!couponData){
            return res.status(400).json({
                message:"coupon code save failed",
                success: false,
                error: true
            })
        }

        return res.status(200).json({
            message:"coupon code added successfully",
            success: true,
            error: false,
            data: couponData
        })
    }catch(error){
        console.log("error in add coupon ..:", error)
        return res.status(500).json({
            message:"network error",
            success: false,
            error: error,
        })
    }

}

const viewCoupon = async( req, res) =>{

    try {

  const couponDatas = await couponSchema.find();

  if(!couponDatas){
    return res.status(400).json({
        message:"no coupons found",
        success: true,
        error:false,
    })
  }
  return res.status(200).json({
    message:"couponcode found successfully",
    success: true,
    data:couponDatas,
    error: false
  })

} catch(error){
    return res.status(500).json({
        message:"network error",
        success: true,
        error: false,
    })
}
}

const deleteCoupon = async( req, res) =>{

    try {

        const id = req.params.id;

        console.log("coupon delete id", id);

        if(!id){
            return res.status(400).json({
                message:"coupon id not found",
            })
        }

        const deleteCouponData =  await couponSchema.findByIdAndDelete({_id:id})

        if(!deleteCouponData){
            return res.status(409).json({
                message:"coupon discount delete failed",
                success: false,
                error: false,
            })
        }
        return res.status(200).json({
            message:"coupon deleted successfully",
            success: true,
            error: false
        })
    }catch(error){
       console.log("errror..:", error);
        return res.status(500).json({
            message:" network errror",
            success: true,
            error: false,
        })
    }
}

const updateCoupon =  async(req, res) =>{

    try {
        const id = req.params.id;

        if(!id){
            return res.status(400).json({
                message:"coupon id not found"
            })
        }

        const { couponCode, discountType, description} = req.body;

        const updatedCoupons = {
            ...(couponCode && {couponCode}),
            ...(discountType && {discountType}),
            ...( description && { description}),
        } 

        couponProduct = await  couponSchema.findByIdAndUpdate(id,updatedCoupons,{
            new: true,
            runValidators:true,
        })

        if(!couponProduct){
            return res.status(404).json({
                messsage:"coupon update failed",
                success: false,
                error: true,
            })
        }

        return res.status(200).json({
            message:"updated successfully",
            success: true,
             error: false,
             data: couponProduct.toObject(),
        })
    }catch(error){
        console.log("update-coupon-error", error);
        return res.status(500).json({
            message:"network errror",
            success: false,
            error: error
,        })
    }
}

const couponValidation = async (req, res) => {
    try {
        const { couponCode, userId } = req.body;

        if (!couponCode || !userId) {
            return res.status(400).json({
                message: "Coupon code and user ID are required",
                success: false,
                error: true,
            });
        }


        const checkCoupon = await couponSchema.findOne({ couponCode: couponCode });

        console.log("coupon information ", checkCoupon);

        if (!checkCoupon) {
            return res.status(404).json({
                message: "Invalid coupon code",
                success: false,
                error: true,
            });
        }

        if (!checkCoupon.isActive || checkCoupon.couponNumbers <= 0) {
            return res.status(400).json({
                message: "Coupon is no longer available",
                success: false,
                error: true,
            });
        }

        const allCartData = await cartproducts.find({ userId: userId });
        console.log("User cart data:", allCartData);

        if (!allCartData || allCartData.length === 0) {
            return res.status(400).json({
                message: "Cart is empty, cannot apply coupon code",
                success: false,
                error: true,
            });
        }


        let totalPrice = 0;
        allCartData.forEach(product => {
            const totalProductPrice = product.sale_price * product.quantity;
            totalPrice += totalProductPrice;
        });

    

        let cartAmount = totalPrice;

        console.log("Cart amount:", cartAmount);

        if (cartAmount >= checkCoupon.cartAmount) {

            const appliedCouponData = new activatedCoupon({
                couponCode: couponCode,
                userId: userId,
            });

            await appliedCouponData.save();


            checkCoupon.couponNumbers -= 1;
            await checkCoupon.save();

            return res.status(200).json({
                message: "Coupon code applied successfully",
                success: true,
                error: false,
            });
        }


        const differenceAmount = checkCoupon.cartAmount - cartAmount;

        return res.status(400).json({
            message: `Add ${differenceAmount} more to apply the coupon offer`,
            success: false,
            error: true,
        });

    } catch (error) {
        console.log("coupon-validation-error", error);
        return res.status(500).json({
            message: "Network error",
            success: false,
            error: error,
        });
    }
}


module.exports = {addCouponCode, viewCoupon, deleteCoupon, updateCoupon, couponValidation};

