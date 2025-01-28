const express = require("express");
const userRouter = express.Router();
const {getUser} = require('../controllers/regcontroller');
const {vendorRegistration,viewVendorName,VendorLocationUpdate,resetPassword, verifyResetPassword} = require('../controllers/regcontroller')
const Login = require('../controllers/logincontroller')
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

userRouter.post('/user-registration',getUser); //post user-registration
userRouter.post('/vendor-registration', upload.single('image'),vendorRegistration); //post vendor-registration
userRouter.post('/login',Login); //post login
userRouter.get('/view-admin-name',authenticateToken, viewVendorName);
userRouter.put('/vendor-location-update', authenticateToken, VendorLocationUpdate)
userRouter.post('/resetpassword', resetPassword);
userRouter.put('/verify-password/:token', verifyResetPassword);

module.exports =userRouter;