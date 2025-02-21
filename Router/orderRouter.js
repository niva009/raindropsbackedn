const express = require('express');
const orderRouter = express.Router();
const {orderCreation, verifyPayment, userOrderHistory, showVendorOrders,orderUpdateAccepted, orderUpdateDelivered,showVendorDeliveredOrders,orderById} = require('../controllers/orderController')
const authenticateToken = require('../middleware/auth');

orderRouter.post('/order-creation',authenticateToken, orderCreation);
orderRouter.post('/verify-payment', verifyPayment);
orderRouter.get('/user-orders', authenticateToken, userOrderHistory);
orderRouter.get('/vendor-orders',authenticateToken, showVendorOrders );
orderRouter.put('/order-accepted',authenticateToken, orderUpdateAccepted );
orderRouter.put('/order-delivered',authenticateToken, orderUpdateDelivered );
orderRouter.get('/order-delived-count', authenticateToken, showVendorDeliveredOrders);
orderRouter.get('/order/:id', authenticateToken, orderById);


module.exports = orderRouter;