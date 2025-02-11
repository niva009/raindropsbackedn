const { string } = require('i/lib/util');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const cartSchema = new Schema({

    name:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
         required : false,
    },
    sale_price:{
        type: Number,
        required: true,
    },
    discount:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId, ref:"userRegistration", required: true
    },
    category:{
       type: mongoose.Schema.Types.ObjectId, ref:"category", required: true,
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId, ref: "product", required: true,
    },
    companyId:{
        type:mongoose.Schema.Types.ObjectId, ref: "vendor", required: true,
    },
    categoryname:{
        type: String,
        required: false,
    },
    isActive: {
        type: Boolean,
        required: true,
    },  
     isStatus:{
        type: String,
        enum: ['view','accepted', 'delivered'],
    },
    slug:{
        type:String,
        required: true,
    },
    stock:{
        type:String,
        required: true,
    },
    quantity:{
        type:Number,
        require: true,
        default:1
    },  updatedAt: { // Recommended to track updates explicitly
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("cartproducts", cartSchema);