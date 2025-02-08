const productSchema = require("../models/product");
const vendorSchema = require("../models/vendorregistration");


const vendorStatusUpdation = async (req, res) => {
  try {
    const { userId } = req.user;


    if (!userId) {
      return res.status(400).json({
        message: "Vendor ID not found.",
        success: false,
        error: true,  
      });
    }


    const checkVendorValid = await vendorSchema.findOne({ _id:userId });
    if (!checkVendorValid) {
      return res.status(403).json({
        message: "Vendor is not valid.",
        success: false,
        error: true,
      });
    }

    const allActive =(await productSchema.find({ companyId: userId, isActive: false }).countDocuments()) === 0;


    const newStatus = !allActive;

    const result = await productSchema.updateMany(
      { companyId: userId },
      { isActive: newStatus }
    );


    if (result.modifiedCount > 0) {
      console.log(`All products updated to isActive: ${newStatus}`);
      return res.status(200).json({
        message: "Vendor's product statuses updated successfully.",
        success: true,
        error: false,
      });
    } else {
      console.log("No products were updated.");
      return res.status(200).json({
        message: "No products were updated.",
        success: false,
        error: false,
      });
    }
  } catch (error) {
    console.error("Error updating vendor product statuses:", error);
    return res.status(500).json({
      message: "Failed to update vendor's product statuses.",
      success: false,
      error: true,
    });
  }
};

const vendorStatus = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        message: "Vendor ID not found.",
        success: false,
        error: true,
      });
    }

    // Validate the vendor
    const checkVendorValid = await vendorSchema.findOne({ _id: userId });
    if (!checkVendorValid) {
      return res.status(403).json({
        message: "Vendor is not valid.",
        success: false,
        error: true,
      });
    }

    // Fetch all products for the vendor
    const products = await productSchema.find({ companyId: userId });

    if (products.length === 0) {
      return res.status(200).json({
        isActive: false,
        message: "No products found for this vendor.",
        success: true,
      });
    }

    const trueCount = products.filter((product) => product.isActive === true).length;

    console.log("true count..:", trueCount);

    const isActive = trueCount > products.length / 2;

    console.log("isActiveee", isActive);

    return res.status(200).json({
      isActive,
      message: "Vendor status determined based on product status.",
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};

const vendorProducts = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("idd", id);

    if (!id) {
      return res.status(400).json({
        message: "Shop ID not found",
        success: false,
        error: true,
      });
    }

    // Fetch shop products and populate company details
    const shopProducts = await productSchema
      .find({ companyId: id })
      .populate("companyId", "company_name address");

    if (!shopProducts || shopProducts.length === 0) {
      return res.status(404).json({
        message: "Products are not available",
        success: false,
        error: true,
      });
    }

    // Extract company details from the first product (since all belong to the same company)
    const companyDetails = shopProducts[0]?.companyId || {};

    // Transform data to include company details at the top level
    const formattedResponse = {
      message: "Shop products found successfully",
      success: true,
      error: false,
      company_name: companyDetails.company_name || "N/A",
      company_address: companyDetails.address || "N/A",
      company_image: companyDetails.image || "",
      company_phone: companyDetails.contact_number || "",
      data: shopProducts.map(product => ({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        sale_price: product.sale_price,
        discount: product.discount,
        description: product.description,
        image: product.image,
        category: product.category,
        type: product.type,
        categoryname: product.categoryname,
        isActive: product.isActive,
        isStatus: product.isStatus,
        stock: product.stock,
        variants: product.variants,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        productAttribute: product.productAttribute
      })),
    };

    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};



module.exports = { vendorStatusUpdation ,vendorStatus, vendorProducts};
