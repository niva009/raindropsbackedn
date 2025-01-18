const express = require("express");
const userRouter = express.Router();
const {getUser} = require('../controllers/regcontroller');
const {vendorRegistration,viewVendorName,VendorLocationUpdate} = require('../controllers/regcontroller')
const Login = require('../controllers/logincontroller')
const authenticateToken = require('../middleware/auth');


userRouter.post('/user-registration',getUser); //post user-registration
userRouter.post('/vendor-registration',vendorRegistration); //post vendor-registration
userRouter.post('/login',Login); //post login
userRouter.get('/view-admin-name',authenticateToken, viewVendorName);
userRouter.put('/vendor-location-update', authenticateToken, VendorLocationUpdate)

module.exports =userRouter;