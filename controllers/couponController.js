const couponSchema = require('../models/couponSchema');
const activatedCoupon = require('../models/activatedCoupon')
const cartproducts = require('../models/cartSchema');


const addCouponCode = async(req, res) =>{

    try {
        const { userId } = req.user; 
        const { couponCode, discountType, description, isActive, couponNumbers, cartAmount} = req.body;

        console.log("couponcodeeee",req.body);
        console.log(req.header);

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
            cartAmount,
            couponNumbers,
            company_Id: userId,
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

        const id = req.params.id;

        console.log("reqid", id);
  const couponDatas = await couponSchema.find({company_Id:id});

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
            error: false,
            data:deleteCoupon,
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

        const usedCoupon = await activatedCoupon.findOne({couponCode:couponCode, userId: userId})

        if(usedCoupon){
            return res.status(400).json({
                message:"coupon already used",
                success: false,
                error: true,
            })
        }

        console.log("Coupon code data:", req.body);

        if (!couponCode || !userId) {
            return res.status(400).json({
                message: "Coupon code is required",
                success: false,
                error: true,
            });
        }

        // Fetch the coupon details
        const checkCoupon = await couponSchema.findOne({ couponCode: couponCode });

        console.log("Coupon information:", checkCoupon);

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

        // Fetch user's cart data
        const allCartData = await cartproducts.find({ userId: userId });
        console.log("User cart data:", allCartData);

        if (!allCartData || allCartData.length === 0) {
            return res.status(400).json({
                message: "Cart is empty, cannot apply coupon code",
                success: false,
                error: true,
            });
        }

        // Calculate total cart amount
        let totalPrice = allCartData.reduce((acc, product) => acc + (product.sale_price * product.quantity), 0);
        console.log("Original Cart Total Price:", totalPrice);

        if (totalPrice < checkCoupon.cartAmount) {
            const differenceAmount = checkCoupon.cartAmount - totalPrice;
            return res.status(400).json({
                message: `Add ${differenceAmount} more to apply the coupon offer`,
                success: false,
                error: true,
            });
        }

        let discountAmount = 0;

        if (checkCoupon.discountType?.type === "percentage") {
            discountAmount = (totalPrice * checkCoupon.discountType.value) / 100;
        } else if (checkCoupon.discountType?.type === "fixed") {
            discountAmount = checkCoupon.discountType.value;
        }

        const newCartAmount = totalPrice - discountAmount;
        console.log("New cart amount after discount:", newCartAmount);


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
            newTotalPrice: newCartAmount,
            discountAmount:discountAmount,
        });

    } catch (error) {
        console.error("Coupon validation error:", error);
        return res.status(500).json({
            message: "Network error",
            success: false,
            error: error,
        });
    }
};



module.exports = {addCouponCode, viewCoupon, deleteCoupon, updateCoupon, couponValidation};

