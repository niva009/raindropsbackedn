const express = require('express');
const cartRouter = express.Router();
const authorization = require('../middleware/auth')
const {addtoCart, deleteCart, viewCart,deleteAllCart,cartIncrement,cartDicrement} = require('../controllers/cartcontroller')

cartRouter.post('/add-cart',authorization, addtoCart)
cartRouter.delete('/delete-cart/:id',authorization, deleteCart)
cartRouter.get('/view-cart',authorization, viewCart)
cartRouter.delete('/delete-all-cart',authorization, deleteAllCart)
cartRouter.put('/cart-increment',authorization, cartIncrement);
cartRouter.put('/cart-dicrement',authorization, cartDicrement);


module.exports = cartRouter