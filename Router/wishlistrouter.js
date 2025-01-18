const express = require("express");
const wishlistRouter = express.Router();
const {addtoWishlist,viewWishlist, deleteWishlist} = require('../controllers/wishlistcontroller')  
const authenticateToken = require('../middleware/auth');


wishlistRouter.post('/add-wishlist', authenticateToken, addtoWishlist);
wishlistRouter.get('/wishlist', authenticateToken, viewWishlist);
wishlistRouter.delete('/wishlist-delete/:id', authenticateToken, deleteWishlist);


module.exports = wishlistRouter;