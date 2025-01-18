const express = require('express');
const smsRouter = express.Router();
const { sendOtp, verifyOtp} = require('../controllers/smsController');

smsRouter.post('/send-otp', sendOtp);
smsRouter.post('/verify-otp', verifyOtp);


module.exports = smsRouter;
