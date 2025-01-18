const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/userregistration'); 
const otpSchema = require('../models/otpSchema'); 

const JWT_SECRET = process.env.JWT_SECRET;


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);



const sendOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;

    console.log("phone number ..:", phone_number);

    if (!phone_number) {
      return res.status(400).json({
        message: 'Phone number is required',
        success: false,
        error: true,
      });
    }


    const existingUser = await userSchema.findOne({ phone_number });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in database (update if the phone number already exists in otpSchema)
    await otpSchema.findOneAndUpdate(
      { phone_number },
      { phone_number, otp, createdAt: new Date() },
      { upsert: true } 
    );


    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number,
    });

    res.status(200).json({
      message: 'OTP sent successfully',
      success: true,
      error: false,
      isNewUser: !existingUser, // Inform frontend whether the user is new
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      success: false,
      error: true,
    });
  }
};

const verifyOtp = async (req, res) => {
    try {
      const { phone_number, otp } = req.body;
  
      if (!phone_number || !otp) {
        return res.status(400).json({
          message: 'Phone number and OTP are required',
          success: false,
          error: true,
        });
      }
  

      const storedOtp = await otpSchema.findOne({ phone_number });
  
      if (!storedOtp || storedOtp.otp !== otp) {
        return res.status(400).json({
          message: 'Invalid OTP',
          success: false,
          error: true,
        });
      }
  

      let user = await userSchema.findOne({ phone_number });
  
      if (!user) {
        user = new userSchema({ phone_number });
        await user.save();
      }
  
  
      const token = jwt.sign(
        { userId: user._id, phone_number: user.phone_number },
        JWT_SECRET,
        { expiresIn: '12h' }
      );
  
  
      await otpSchema.deleteOne({ phone_number });
  
      res.status(200).json({
        message: 'Login successful',
        success: true,
        error: false,
        token,
        user: {
          userId: user._id,
          phone_number: user.phone_number,
        },
      });
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      res.status(500).json({
        message: 'Failed to verify OTP',
        success: false,
        error: true,
      });
    }
  };

  module.exports = {sendOtp, verifyOtp};
  
