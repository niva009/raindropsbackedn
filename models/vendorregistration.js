const mongoose = require("mongoose");
const { Schema } = mongoose;


const vendorRegistration = new Schema ({

    company_name:{
        type:String, required:true,unique:true,sparse:true
    },
    fssai_license:{
        type:String, required: false,
    },
    gst_number:{
        type:String, required: false,
    },
    address:{
        type:String, required: true,
    },
    image:{
        type:String, required:false,
    },
    pincode:{
        type:String, required:true,
    },
    state:{
        type:String, required: true,
    },
    district:{
        type:String, required: true,
    },
    contact_number:{
        type:Number, required: true,
    },
    role:{
        type:Number, require: true, default:2,
    },
    email:{
        type:String, required:true,
    },
    password:{ type: String, required: true},
    paymentOption:{
        type:String, required:true, enum:['weekly','monthly'], default:'monthly',
    },
    isActive:{
        type:Boolean, default:true
    },
    location: {
        type: {
          type: String,
          enum: ["Point"], // Use "Point" (uppercase)
          required: true,
        },
        coordinates: {
          type: [Number], // Array [longitude, latitude]
          required: true,
        },
      },

}, {timestamps: true })



vendorRegistration.index({ location: '2dsphere' });

module.exports = mongoose.model('vendor',vendorRegistration)