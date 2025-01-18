const cartSchema = require('../models/cartSchema');
const product = require('../models/product');
const productSchema = require("../models/product");
const variantSchema = require('../models/variantSchema');

const addtoCart = async (req, res) => {
    try {
        const { userId } = req.user; 
        console.log("User ID:", userId);

        const { productId,  quantity } = req.body; 

        console.log("quantity ...:", quantity);

        if (!productId || !quantity) {
            return res.status(400).json({ 
                message: "Product ID and quantity are required", 
                success: false, 
                error: true 
            });
        }

        console.log("Product ID:", productId);

        let cartProduct = await productSchema.findOne({ _id: productId });

        if (cartProduct) {
            let productDuplicate = await cartSchema.findOne({ slug: cartProduct?.slug, userId: userId });
            if (productDuplicate) {
                return res.status(409).json({
                    message: "Product already exists in cart",
                    success: false,
                    error: true,
                });
            } 

            if(cartProduct && cartProduct.isActive === false){
                return res.status(400).json({
                    message:"product currently inactive",
                    success: false,
                    error: true,
                })
            }

            if (quantity > parseInt(cartProduct?.stock)) {
                return res.status(401).json({
                    message: `Cart quantity must be less than or equal to stock ${cartProduct?.stock}`,
                    success: false,
                    error: true,
                });
            }

            const saveCart = new cartSchema({
                name: cartProduct.name,
                sale_price: cartProduct.sale_price,
                quantity: quantity,
                productId:productId,
                image: cartProduct.image || "",
                companyId:cartProduct.companyId || "",
                isActive: cartProduct.isActive || "", 
                isStatus: cartProduct.isStatus || "",
                category: cartProduct.category,
                userId: userId,  // Attach userId from the JWT
                categoryname: cartProduct.categoryname || "",
                slug: cartProduct.slug || "",
                stock: cartProduct.stock || 0,
                discount:cartProduct.discount,
            });

            await saveCart.save();

            return res.status(200).json({
                message: "Product added to cart",
                data: saveCart,
                success: true,
                error: false,
            });
        }

        let cartVariant = await variantSchema.findOne({ _id: productId });

        if (!cartVariant) {
            return res.status(404).json({
                message: "Product or Variant not found",
                success: false,
                error: true,
            });
        }

        let variantDuplicate = await cartSchema.findOne({ slug: cartVariant?.slug, userId: userId });
        if (variantDuplicate) {
            return res.status(409).json({
                message: "Product already exists in cart",
                success: false,
                error: true,
            });
        }

        if (quantity > parseInt(cartVariant?.stock)) {
            return res.status(401).json({
                message: "Cart quantity must be less than or equal to stock",
                success: false,
                error: true,
            });
        }

        console.log("Wishlist variant data:", cartVariant);

        const saveCartVariant = new cartSchema({
            name: cartVariant.name || "Unnamed Product",
            sale_price: cartVariant.sale_price || 0,
            image: cartVariant.image || "",
            productId: productId,
            userId: userId, // Attach userId from the JWT
            category: cartVariant.category || "Unknown Category",
            categoryname: cartVariant.categoryname || "Unknown Category Name",
            slug: cartVariant.slug || "unknown-slug",
            stock: cartVariant.stock || 0,
            quantity: quantity,
            discount: cartVariant.discount,
        });

        await saveCartVariant.save();

        return res.status(200).json({
            message: "Variant added to cart",
            data: saveCartVariant,
            success: true,
            error: false,
        });

    } catch (error) {
        console.error('Error adding to cart:', error); 
        return res.status(500).json({
            message: "Error adding to cart",
            error: error.message,
            success: false,
        });
    }
};

const deleteCart = async( req, res) =>{
    
    try {
        const id = req.params.id;

        if(!id){
            return res.status(400).json({
                message:"id not found",
                success: false,
                error: true,
            })
        }

        const cartdeleteProudct = await cartSchema.findByIdAndDelete({_id:id})

        if(!cartdeleteProudct){
            return res.status(400).json({
                message:"product not found in cart",
                success: false,
                error: true,
            })
        }
        res.status(200).json({
            message:"successfully deleted from cart",
            success: true,
            error: false,
        })
    } catch(errro){
        return res.status(500).json({
            message:"internal server error",
            success: false,
            error: true,
        })
    }
}

const viewCart = async (req, res) => {
    try {
        const { userId } = req.user; 

        let cartproducts = await cartSchema.find({ userId: userId });

        console.log("cartproductssss.", cartproducts);

        if (cartproducts.length === 0) {
            return res.status(401).json({
                message: "Cart is empty",
                success: true,
                error: false,
            });
        }

        let totalPrice = 0;
        let totalDiscount = 0;

        cartproducts.forEach(product => {
            const totalProductPrice = product.sale_price * product.quantity;
            const discountAmount = parseFloat(product.discount) || 0;  // Parse discount and handle cases where it might not be a valid number
            totalDiscount += discountAmount * product.quantity;  // Add the discount for each product's quantity
            totalPrice += totalProductPrice;  // Add the total price for the product
        });

        const totalItems = cartproducts.length;

        console.log("Total Discount:", totalDiscount);

        res.status(200).json({
            message: "Cart products",
            data: { products: cartproducts, totalitems: totalItems, totalPrice: totalPrice, totalDiscount: totalDiscount },
            success: true,
            error: false,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
            error: true,
        });
    }
};

const deleteAllCart = async (req, res) => {
    try {
        const { userId } = req.user; 

        // Delete all cart items for the given userId
        const result = await cartSchema.deleteMany({ userId: userId });

        // Check if any documents were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "No cart items found to delete",
                success: false,
                error: true
            });
        }

        res.status(200).json({
            message: "Cart items deleted successfully",
            success: true,
            error: false,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
            error: true
        });
    }
};

const cartIncrement = async ( req, res) =>{

    try{

        const { userId } = req.user; 
        const { productId} = req.body;

    console.log(`userid and productid..:,${userId},${productId}`);

 if(!productId || !userId){
    return res.status(401).json({
        message:" product id and userId is required",
        success: false,
        error: true,
    })
}
const cartProduct = await cartSchema.findOneAndUpdate(
    {
        userId: userId,
        productId: productId,
        $expr: {
            $lt: ["$quantity", { $toInt: "$stock" }], 
        },
    },
    { 
        $inc: { quantity: 1 }, 
        $set: { updatedAt: Date.now() } 
    },
    { new: true }
);

if (!cartProduct) {
    return res.status(400).json({
        message: "Cannot increment quantity stock limit reached!",
        success: false,
        error: true,
    });
}
    return res.status(200).json({message:"cart incremented successfully", success:true, error: false})

 }catch(error){
    console.error("Error incrementing cart item:", error); 
    return res.status(500).json({message: "internal server error", success: false, error: true, error: error})

 }}

 const cartDicrement = async ( req, res) =>{

    try{

        const { userId } = req.user; 
        const { productId} = req.body;


 if(!productId || !userId){
    return res.status(401).json({
        message:" product id and userId is required",
        success: false,
        error: true,
    })
}
const cartProduct = await cartSchema.findOneAndUpdate(
    {
        userId: userId,
        productId: productId,
        quantity: { $gt: 1 },

    },
    { 
        $inc: { quantity: -1 }, 
        $set: { updatedAt: Date.now() } 
    },
    { new: true }
);

if (!cartProduct) {
    return res.status(400).json({
        message: "Cannot dicrement quantity stock is 0!",
        success: false,
        error: true,
    });
}
    return res.status(200).json({message:"cart dicrement successfully", success:true, error: false})

 }catch(error){
    console.error("Error dicrementing cart item:", error); 
    return res.status(500).json({message: "internal server error", success: false, error: true, error: error})

 }}


module.exports = { addtoCart, deleteCart,viewCart, deleteAllCart, cartIncrement, cartDicrement};
