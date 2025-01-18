const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  productInformation: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: false, // optional
      },
      sale_price: {
        type: Number,
        required: true,
      },
      discount: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      userId: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      productId: {
        type: String,
        required: true,
      },
      categoryname: {
        type: String,
        required: false, 
      },
      slug: {
        type: String,
        required: true,
      },  
     companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vendor',
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
},
isStatus:{
    type: String,
    enum: ['view','accepted', 'delivered'],
    default:'view',
},

      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, 'Quantity cannot be less than 1'],
      },
    },
  ],
  couponCode: {
    type: String,
    required: false, 
  },
  paymentId: {
    type: String,
    required: false, 
  },
  payment_type: {
    type: String,
    required: true,
  },
  addressId: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number, 
    required: true,
    min: [0, 'Total amount cannot be less than 0'],
  },
  payment_id:{
    type: String,
     required: false,

  },paymentStatus:{
    type:String,
    enum :['pending', "cancelled", 'success'],
    default:"pending",
  },
  paymentId:{
    type:String,
    required: false,
  },
},{ timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
