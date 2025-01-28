const userSchema = require("../models/userregistration");
const loginSchema = require("../models/login")
const bcrypt = require("bcrypt");
const VendorSchema = require('../models/vendorregistration')
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken'); 
require("dotenv").config();




const getUser = async (req, res) => {
  try {
    const { name, email, password, re_password } = req.body;

    console.log(req.body);

    if (!name || !email || !password || !re_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== re_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const oldEmail = await userSchema.findOne({ email });
    if (oldEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

 
    const newUser = new userSchema({
      name,
      email,
      password: hashPassword,
    });

    await newUser.save();

    const newLogin = new loginSchema({
      email,
      password: hashPassword,
      user_id: newUser._id,
    });

    await newLogin.save();

    res.status(201).json({ message: "User registered successfully" });
    
  } catch (error) {
 
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




const transporter = nodemailer.createTransport({

  service: 'gmail',
  auth:{
    user : "raindropsindian@gmail.com",
    pass: 'subl nxvh muzn xwhk',
  },


})

const resetPassword = async (req, res) => {
  try {
    console.log("Reset password request received.");

    const { email } = req.body;
    console.log("Email provided:", email);

    const checkEmailValidation = await userSchema.findOne({ email });
    if (!checkEmailValidation) {
      console.log("Email not found in database.");
      return res.status(403).json({
        message: "Email does not exist",
        success: false,
        error: true,
      });
    }

    console.log("Email found in database:", checkEmailValidation);

    const token = jwt.sign(
      { userId: checkEmailValidation._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Generated JWT token:", token);

    const resetUrl = `${process.env.FRONTEND_URL}/authentication/${token}/reset-password`;
    console.log("Generated reset URL:", resetUrl);

    const mailOptions = {
      from: "raindropsindian@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetUrl}`,
    };

    console.log("Sending email...");
    const emailResponse = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", emailResponse);

    return res.status(200).json({
      message: "Password reset email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error during password reset process:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyResetPassword = async(req, res) =>{

  try {

    const { token } = req.params;
    const {password} = req.body;

    console.log("token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded uer id...:", decoded.userId);

    const user = await userSchema.findOne({_id:decoded.userId});


    console.log("userrr", user);



    if(!user){
      return res.status(400).json({
        message:"usernot found error",
        success: false,
        error: true,
      })
    }
    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    user.save();

    return res.status(200).json({
      message:"password reseted successfully",
      succes: true,
      error: false,
    })

  }catch(error){

    console.log("verification error", error)

    return res.status(500).json({
      message:"internal server error updating password",error,
      succes: false,
      error: error,
    })

  }
}






//////vendors registration///////////////////


const vendorRegistration = async (req, res) => {
  try {
    const {
      company_name,
      fssai_license,
      gst_number,
      address,
      pincode,
      state,
      district,
      contact_number,
      email,
      password,
      paymentOption,
      isActive,
      latitude,
      longitude,
    } = req.body;

    const image = req.file ? `${req.file.filename}` : undefined;
    console.log('Uploaded File:', req.file);


    console.log("Vendor Data:", req.body);

    // Validate mandatory fields
    if (!company_name || !address || !pincode || !state || !district || !email || !password || !contact_number) {
      return res.status(400).json({
        message: "Fields required: company_name, address, pincode, state, district, email, contact_number and password.",
        success: false,
        error: true,
      });
    }

    // Check for existing vendor based on email or company_name
    const oldData = await VendorSchema.findOne({
      $or: [{ email: email }, { company_name: company_name }],
    });

    if (oldData) {
      return res.status(400).json({
        message: "Email or company name already exists.",
        success: false,
        error: true,
      });
    }

    // Dynamically check for GST or FSSAI license if provided
    const queryConditions = [];
    if (gst_number) queryConditions.push({ gst_number: gst_number });
    if (fssai_license) queryConditions.push({ fssai_license: fssai_license });

    if (queryConditions.length > 0) {
      const oldInfo = await VendorSchema.findOne({ $or: queryConditions });

      if (oldInfo) {
        return res.status(400).json({
          message: "This GST or FSSAI number already exists.",
          success: false,
          error: true,
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save vendor details
    const vendorData = new VendorSchema({
      company_name,
      fssai_license,
      gst_number,
      address,
      pincode,
      state,
      district,
      contact_number,
      email,
      password: hashedPassword,
      paymentOption,
      isActive,
      image,
      location: {
        type: "Point", // Set GeoJSON type
        coordinates: [longitude, latitude], // Longitude first, then latitude
      },
    });

    await vendorData.save();

    // Create a login record
    const newLogin = new loginSchema({
      email,
      password: hashedPassword,
      user_id: vendorData._id,
    });

    await newLogin.save();

    // Send success response
    res.status(200).json({
      message: "Vendor saved successfully.",
      data: vendorData,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error during vendor registration:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message || error,
      success: false,
    });
  }
};



const viewVendorName = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(404).json({
        message: "User ID not present",
        success: false,
        error: true,
      });
    }

    const vendor = await VendorSchema.findOne({ _id: userId });

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "User information found successfully",
      success: true,
      error: false,
      data: vendor.company_name || null, 
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
      success: false,
      error: true,
      details: error.message, 
    });
  }
};

const VendorLocationUpdate = async( req, res) =>{

  try {

    const { userId } = req.user;

    const { latitude, longitude} = req.body

    console.log("latitude and logitude", latitude, longitude);

    if(!userId){
      return res.status(403).json({
        message:"user id not found",
        success: false,
        error: true,
      })
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and Longitude are required",
        success: false,
        error: true,
      });
    }

    const updatedVendor = await VendorSchema.findByIdAndUpdate(
      userId,
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [latitude, longitude], 
          },
        },
      },
      { new: true } 
    );

    if (!updatedVendor) {
      return res.status(404).json({
        message: "Vendor not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Location updated successfully",
      success: true,
      error: false,
      data: updatedVendor.location, // Return updated location
    });


  }catch(error){
    console.log("error updating latitude and longitude..:", error);
  }

}

module.exports = { getUser ,vendorRegistration,viewVendorName,VendorLocationUpdate,resetPassword,verifyResetPassword};
