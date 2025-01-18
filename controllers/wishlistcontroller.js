
const wishlistSchema = require('../models/wishlistSchema');
const productSchema = require("../models/product");
const variantSchema = require('../models/variantSchema');




const addtoWishlist = async (req, res) => {
    try {
        const { userId } = req.user; 
        console.log("User ID:", userId);

        const { productId } = req.body; 

        if (!productId) {
            return res.status(400).json({ 
                message: "Product ID is required", 
                success: false, 
                error: true 
            });
        }

        console.log("Product ID:", productId);

        let wishlistProduct = await productSchema.findOne({ _id: productId });


        if (wishlistProduct) {
            let productDuplicate = await wishlistSchema.findOne({ slug: wishlistProduct?.slug });
            if (productDuplicate) {
                return res.status(409).json({
                    message: "Product already exists in wishlist",
                    success: false,
                    error: true,
                });
            }

            const saveWishlist = new wishlistSchema({
                name: wishlistProduct.name,
                sale_price: wishlistProduct.sale_price,
                image: wishlistProduct.image || "",
                category: wishlistProduct.category,
                userId: userId,  // Attach userId from the JWT
                categoryname: wishlistProduct.categoryname || "",
                slug: wishlistProduct.slug || "",
                stock: wishlistProduct.stock || 0,
            });

            await saveWishlist.save();

            return res.status(200).json({
                message: "Product added to wishlist",
                data: saveWishlist,
                success: true,
                error: false,
            });
        }

        let wishlistVariant = await variantSchema.findOne({ _id: productId });

        if (!wishlistVariant) {
            return res.status(404).json({
                message: "Product or Variant not found",
                success: false,
                error: true,
            });
        }

        let variantDuplicate = await wishlistSchema.findOne({ slug: wishlistVariant?.slug });
        if (variantDuplicate) {
            return res.status(409).json({
                message: "product already exists in wishlist",
                success: false,
                error: true,
            });
        }

        console.log("Wishlist variant data:", wishlistVariant);


        const saveWishlistVariant = new wishlistSchema({
            name: wishlistVariant.name || "Unnamed Product",
            sale_price: wishlistVariant.sale_price || 0,
            image: wishlistVariant.image || "",
            userId: userId, // Attach userId from the JWT
            category: wishlistVariant.category || "Unknown Category",
            categoryname: wishlistVariant.categoryname || "Unknown Category Name",
            slug: wishlistVariant.slug || "unknown-slug",
            stock: wishlistVariant.stock || 0,
        });

        await saveWishlistVariant.save();

        return res.status(200).json({
            message: "Variant added to wishlist",
            data: saveWishlistVariant,
            success: true,
            error: false,
        });

    } catch (error) {
        console.error('Error adding to wishlist:', error);  // Log the error for debugging
        return res.status(500).json({
            message: "Error adding to wishlist",
            error: error.message,
            success: false,
        });
    }
};


const viewWishlist = async ( req, res) =>{

    try {

        const { userId } = req.user; 

        let wishlistProduct = await wishlistSchema.find({ userId: userId})

        if(wishlistProduct.length === 0){
            return res.status(401).json({
                message:"wishlist is empty",
                success: true,
                error: false,
            })
        }

        const totalitems = wishlistProduct.length;

        res.status(200).json({
            message:"wishlist products",
            data: {products:wishlistProduct,totalitems:totalitems},
            success: true,
            error: false,
        })
    }catch(error){
        res.status(500).json({
            message:"internal server error",
            error: error,
            success: false,
            errror: true
        })
    }
}

const deleteWishlist = async( req, res) =>{

    const id = req.params.id;

    const wishlistProduct = await wishlistSchema.findByIdAndDelete({_id: id})

    if(!wishlistProduct){
        return res.status(401).json({
            message:"product not found in wishlist",
            success: false,
            error: true,
        })
    }

    res.status(200).json({
            message:"product deleted from wishlist successfully",
            success: true,
            error: false,

})
}



module.exports = {addtoWishlist,viewWishlist, deleteWishlist};