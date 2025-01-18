const express = require('express');
const addressRouter = express.Router();
const { addAddress, deleteAddress,updateAddress, viewAddress,viewUserAddress } = require('../controllers/addressController');
const authenticateToken = require('../middleware/auth');


addressRouter.post('/add-address',authenticateToken, addAddress);
addressRouter.delete('/remove-address/:id',authenticateToken, deleteAddress);
addressRouter.put('/update-address/:id',authenticateToken,updateAddress);
addressRouter.get('/view-address', authenticateToken, viewAddress);
addressRouter.get("/view-address/:id", viewUserAddress);


module.exports = addressRouter;