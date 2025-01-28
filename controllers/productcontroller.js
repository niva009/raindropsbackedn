const productSchema = require('../models/product');
const categorySchema = require('../models/category');
const variantSchema = require('../models/variantSchema')
const vendorSchema = require('../models/vendorregistration');
const mongoose = require('mongoose');

const addProduct = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const {
            name,
            price,
            sale_price,
            description,
            category,
            type,
            stock,
            productAttribute,
            variants,
        } = req.body;

        const image = req.file ? `${req.file.filename}` : undefined;

        console.log("compony id....", userId);

        console.log("Name, price, category:", name, price, category);

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(400).json({ message: "Please fill all the required fields." });
        }

        // Generate slug dynamically based on the name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // Remove invalid characters
            .trim()
            .replace(/\s+/g, "-"); // Replace spaces with hyphens

        // Ensure the slug is unique
        const slugPrevious = await productSchema.findOne({ slug: slug });
        if (slugPrevious) {
            return res.status(400).json({ message: "Slug must be unique", success: false });
        }

        // Check if the category exists
        const oldCategory = await categorySchema.findById(category);
        if (!oldCategory) {
            return res.status(400).json({ message: "Invalid category ID", success: false });
        }

        // Validate price values
        if (parseFloat(price) <= 0 || parseFloat(sale_price) < 0) {
            return res.status(400).json({ message: "Invalid price or sale price values." });
        }

        // Calculate discount
        const discount = ((price - sale_price) / price) * 100;

        console.log("Product attribute..:", JSON.stringify(productAttribute));


        // Parse product attribute
        let parsedProductAttribute;
        try {
            if (typeof productAttribute === "string") {
                parsedProductAttribute = JSON.parse(productAttribute);
            } else {
                parsedProductAttribute = productAttribute;
            }
        } catch (err) {
            return res.status(400).json({ message: "Invalid productAttribute format." });
        }

        if (!parsedProductAttribute || !parsedProductAttribute.type || !parsedProductAttribute.value) {
            return res
                .status(400)
                .json({ message: "Product attribute type and value are required." });
        }

        // Validate product attribute type
        if (!["kg", "liter", "piece", "pack"].includes(parsedProductAttribute.type)) {
            return res.status(400).json({
                message: "Invalid product attribute type. Valid types are: kg, liter, piece, pack.",
            });
        }

        // Prepare product details
        const productDetails = new productSchema({
            name: name,
            slug,
            price: price,
            sale_price: sale_price,
            discount: discount.toFixed(2),
            image,
            description: description,
            type: type,
            stock: stock,
            companyId: userId,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            category: oldCategory._id,
            categoryname: oldCategory.name,
            productAttribute: parsedProductAttribute,
        });

        // Handle variants if the product type is "variant"
        if (type === "variant" && variants && Array.isArray(variants) && variants.length > 0) {
            console.log("Variants array received:", variants);
            const variantList = [];

            for (let variantData of variants) {
                const {
                    name,
                    sale_price,
                    image,
                    description,
                    stock,
                    productAttribute,
                    isActive,
                } = variantData;

                // Generate slug for variant based on its name
                const variantSlug = name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .trim()
                    .replace(/\s+/g, "-");

                if (!name || !sale_price) {
                    return res.status(400).json({
                        message: "Name and sale_price are required fields for a variant.",
                    });
                }

                let parsedProductAttribute;
                try {
                    parsedProductAttribute =
                        typeof productAttribute === "string"
                            ? JSON.parse(productAttribute)
                            : productAttribute;
                } catch (err) {
                    return res
                        .status(400)
                        .json({ message: "Invalid productAttribute format for variant." });
                }

                if (!parsedProductAttribute || !parsedProductAttribute.type || !parsedProductAttribute.value) {
                    return res.status(400).json({
                        message: "Product attribute type and value are required for the variant.",
                    });
                }

                const variant = new variantSchema({
                    name,
                    image,
                    isActive: isActive !== undefined ? isActive : true,
                    description,
                    sale_price,
                    stock,
                    slug: variantSlug,
                    category: oldCategory._id,
                    categoryname: oldCategory.name,
                    productAttribute: parsedProductAttribute,
                });

                try {
                    await variant.save();
                    variantList.push(variant);
                } catch (error) {
                    return res.status(500).json({ message: "Error saving variant", error: error.message });
                }
            }

            productDetails.variants = variantList;
        }

        // Save product details
        await productDetails.save();
        console.log("Product details with variants:", productDetails);

        return res.status(200).json({
            message: "Product added successfully",
            data: productDetails,
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({
            message: "An error occurred",
            success: false,
            error: error.message,
        });
    }
};


const viewProducts = async (req, res) => {
    try {
      // Fetch all products and populate the 'companyId' field
      const products = await productSchema.find().populate("companyId");
  
      if (!products || products.length === 0) {
        // Handle the case where no products are found
        return res.status(404).json({
          message: "Products not found",
          success: false,
          error: false,
        });
      }
  
      // Return the products data with a 200 status code
      return res.status(200).json({
        message: "Product data retrieved successfully",
        data: products,
        success: true,
        error: false,
      });
    } catch (error) {
      // Handle any unexpected errors
      return res.status(500).json({
        message: "An error occurred while fetching products",
        success: false,
        error: error.message,
      });
    }
  };
  


const viewVendorProduct = async(req, res) =>{
    try {
        const {userId} = req.user;

        if(!userId){
            return res.status(400).json({
                message:"vendor id not found",
                success: false,
                error: true,
            })
        }

        const vendorProductData = await productSchema.find({companyId: userId});

        if(!vendorProductData){
            return res.status(403).json({
                message:"product not found...;",
                succes: false,
                error: true,
            })

        }
        return res.status(200).json({
            message:"vendor product found..:",
            success: true,
            error: false,
            data: vendorProductData,
        })
    }catch(error){
        return res.status(500).json({
            message:"internal server errro",
        })
    }
}

const deleteProduct = async(req, res) =>{

    try{
        const id = req.params.id;
        const product = await productSchema.findByIdAndDelete({_id:id});

        if(product){
            res.status(200).json({message:"product deleted",data:product,success:true,error:false})
        }
        else{
            res.status(400).json({message:"product not found"});
        }

    }catch(error){
        res.status(500).json({message:"error",success:false,error:error.message});
    }
}



const updateProducts = async (req, res) => {
    try {
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({ message: "ID not provided" });
      }
  
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
  
      console.log("Provided ID:", id);
  
      // Destructure all possible fields from req.body
      const {
        name,
        slug,
        price,
        sale_price,
        description,
        category,
        type,
        companyId,
        isActive,
        stock,
        productAttribute,
        isStatus, // Explicitly destructure isStatus
      } = req.body;
  
      console.log("req.body:", req.body);
  
      // Fetch the existing product
      const existingProduct = await productSchema.findById(id);
  
      console.log("Existing Product:", existingProduct);
  
      if (!existingProduct) {
        return res
          .status(404)
          .json({ message: "Product not found", success: false, error: true });
      }
  
      // Prepare the update data
      const updateData = {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(price && { price }),
        ...(sale_price && { sale_price }),
        ...(description && { description }),
        ...(isStatus && { isStatus }), // Add isStatus if it exists in the request
        ...(category && { category }),
        ...(type && { type }),
        ...(companyId && { companyId }),
        ...(isActive !== undefined && { isActive }),
        ...(stock && { stock }),
        ...(productAttribute && {
          productAttribute: {
            ...existingProduct.productAttribute,
            ...productAttribute,
          },
        }),
      };
  
      console.log("Update Data:", updateData);
  
      // Perform the update
      const updatedProduct = await productSchema.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedProduct) {
        return res
          .status(404)
          .json({ message: "Product not found after update", success: false });
      }
  
      res.status(200).json({
        message: "Product updated successfully",
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  

  

const deleteVarint = async( req, res) =>{
    try{

        const id = req.params.id;

        const product = await variantSchema.findByIdAndDelete({_id: id})


        if(!product)return res.status(401).json({ message:"variant product not found", success: false, error: true})

            const updateProduct = await productSchema.updateOne(
                {variants: id},
                { $pull : {variants:id} },

            )

            // console.log("find update varint ", updateProduct);
           
            if(updateProduct.modifiedCount === 0){
                return res.status(400).json({
                    message:"varaint deleted but not updated in product",
                })
            }

            res.status(200).json({ message:"variant product deleted successfully"});
        
    }catch(error){
         res.status(500).json({ message:"variant delete problem"})
        console.log("error delete variant product");
    }
}


const updateVarint = async ( req, res) =>{
    try{

        const id = req.params.id;

        if(!id){
            return res.status(401).json({message:"id not found"});
        }
       const {name, sale_price, description, stock, productAttribute} = req.body;
        const image = req.file ? `${req.file.filename}` : undefined;

        updateVarintData = {
            ...(name && { name }),
            ...(sale_price && { sale_price }), 
            ...(description && { description }), 
            ...(stock && { stock }), 
            ...(productAttribute && { productAttribute }), 
            ...(image && {image}),
        };


        const updateProducts = variantSchema.findByIdAndUpdate(id,updateVarintData,{
            new:true,
            runValidators:true,
        })

        if (!updateProducts) {
            return res.status(404).json({ message: "Product not found", success: false, error: true });
        }
        res.status(200).json({ message: "product updated successfully", success: true, error: false, data: updateProducts });
    } catch(error){
        res.status(500).json({message:"variant product upadate failed"});
    }
}

const viewSingleProduct = async (req, res) => {
    try {
        // Get the slug from the request params
        const { id: slug } = req.params;

        // Check if slug is missing
        if (!slug) {
            return res.status(404).json({
                message: "Product slug not found",
                success: false,
                error: true,
            });
        }

        // Find the product using the slug
        const viewProduct = await productSchema.findOne({ slug });

        // Check if product exists
        if (!viewProduct) {
            return res.status(400).json({
                message: "Product not found",
                success: false,
                error: true,
            });
        }

        // Return product data if found
        return res.status(200).json({
            message: "Product found successfully",
            data: viewProduct,
            success: true,
            error: false,
        });
    } catch (error) {
        // Catch any errors and send a generic error response
        console.log("View single product error", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,  // Corrected typo from 'fasle'
            error: error,
        });
    }
};

const searchProductResult = async (req, res) =>{

    try {

        const query = req.query.q || "";
        const result = await productSchema.find({
            name:{ $regex : query, $options : 'i'},
        });

        return res.json(result);

    } catch(error){

        console.log("product search error", error);
        return res.status(500).json({
            message:"product serch error",
            success: false,
            error: true,
        })
    }
}

const searchLowtoHigh = async(req, res) =>{

    try {


        const products = await productSchema.find().sort({ sale_price : 1});

        if(!products){
            return res.status(400).json({
                message: "product not found",
                success: false,
                error: true
            })
        }

        return res.status(200).json({
            message:"product low to high",
            succes: true,
            data: products,
        })

    }catch(error){
        return res.status(500).json({
            message:"network error",
            success: false,
            error: error,
        })
    }
}

const searchHightoLow = async (req, res) => {
    try {
      // Fetch products sorted by sale_price in descending order
      const products = await productSchema.find().sort({ sale_price: -1 });
  
      if (!products || products.length === 0) {
        return res.status(404).json({
          message: "No products found",
          success: false,
          error: true,
        });
      }
  
      // Return sorted products
      return res.status(200).json({
        message: "Products sorted from high to low",
        success: true,
        data: products,
      });
    } catch (error) {
      // Log the error for debugging
      console.error("Error in searchHightoLow:", error);
  
      return res.status(500).json({
        message: "Network error",
        success: false,
        error: error.message, // Send error message for easier debugging
      });
    }
  };



  

  
  const locationBasedProducts = async (req, res) => {
    try {
      const { longitude, latitude } = req.body;

      console.log("latttt", latitude, longitude);

      if (!longitude || !latitude) {
        return res.status(400).json({
          message: "Latitude and longitude are required",
          success: false,
          error: true,
        });
      }
  
      const userLocation = [ latitude,longitude];

      console.log("userlocation...:", userLocation);
  

      const nearbyVendors = await vendorSchema.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: userLocation,
            },
            $maxDistance: 5000, 
          },
        },
      }).select("_id company_name location");
  
      console.log("Nearby vendors found:", nearbyVendors);
  
      // If no vendors found
      if (!nearbyVendors.length) {
        return res.status(404).json({
          message: "No vendors found within 2km radius",
          success: true,
          error: false,
          products: [],
        });
      }
  
      const vendorIds = nearbyVendors.map(vendor => vendor._id);
  
      const products = await productSchema.find({
        companyId: { $in: vendorIds },
        isActive: true,
      }).populate("companyId");
  
      console.log("Products found:", products);
  
      // Return the products
      return res.status(200).json({
        message: "Products found successfully",
        success: true,
        error: false,
        products,
      });
    } catch (error) {
      console.error("Error fetching location-based products:", error);

      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: true,
      });
    }
  };

  const locationbasedVendor = async(req, res) =>{

    try {

        const { latitude, longitude} = req.body;
        console.log("latitude and longitude..:", latitude, longitude);
        const userLocation = [ latitude, longitude];

        const nearbyVendors = await vendorSchema.find({
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: userLocation,
                },
                $maxDistance: 5000, 
              },
            },
          }).select("_id company_name location address image");


          if(!nearbyVendors){
            return res.status(403).json({
              message:"no shops found current location",
              success: true,
              error: false,
            })
          }

          return res.status(200).json({
            message:"shops found successfully",
            success: true,
            error: false,
            data: nearbyVendors,
          })
    }
    catch(error){

      console.log("error location vendorsss", error);
      return res.status(500).json({
        message:"internal server errror",
        success: true,
         error: error,
      })

    }
  }
  
  
  







module.exports = { addProduct ,viewProducts, deleteProduct,updateProducts,deleteVarint, updateVarint,viewSingleProduct,
    searchProductResult,searchLowtoHigh,searchHightoLow,viewVendorProduct, locationBasedProducts, locationbasedVendor
}
