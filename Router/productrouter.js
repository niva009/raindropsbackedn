    const express = require('express');
    const {addProduct} =require('../controllers/productcontroller')
    const {viewproducts} =require('../controllers/productcontroller')
    const {deleteProduct} =require('../controllers/productcontroller')
    const {updateProducts} =require('../controllers/productcontroller')
    const {deleteVarint} =require('../controllers/productcontroller')
    const {updateVarint,viewSingleProduct,searchProductResult,searchLowtoHigh,searchHightoLow,viewVendorProduct,locationBasedProducts} =require('../controllers/productcontroller')
    const productRouter = express.Router();
    const upload = require('../middleware/upload');
    const authenticateToken = require('../middleware/auth');


    productRouter.post('/add-product',upload.single('image'),authenticateToken, addProduct);
    productRouter.get('/product',viewproducts);
    productRouter.get('/vendor-product', authenticateToken, viewVendorProduct);
    productRouter.delete('/product-delete/:id' ,authenticateToken, deleteProduct)
    productRouter.put('/update-product/:id',upload.single('image'),authenticateToken,updateProducts)
    productRouter.delete('/product/varaint/:id', authenticateToken,deleteVarint);
    productRouter.put('/product/updatevariant/:id',authenticateToken,updateVarint);
    productRouter.get('/product/:id',authenticateToken,viewSingleProduct);
    productRouter.get('/search',searchProductResult);
    productRouter.get('/products/low-to-high',searchLowtoHigh);
    productRouter.get('/products/high-to-low',searchHightoLow);
    productRouter.get('/location-products', authenticateToken, locationBasedProducts);

    module.exports = productRouter;