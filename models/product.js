const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
    },
    price: { 
        type: Number, 
        required: true 
    },
    sale_price: { 
        type: Number, 
        required: true 
    },
    discount: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: false,
    },
    image: { 
        type: String, 
        required: true, 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    type: {

        type: String,
        required: true,
        default: "single",
        enum: ["single", "combo"]
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendor',
        required: true,
    },
    companyName:{
        type:String,
        required: false,
    },
    categoryname: {
        type: String,
        required: true,
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
    stock:{
        type:String, 
        require: true,
    },

    productAttribute: {
        type: { 
            type: String, 
            required: true, 
            enum: ['kg', 'liter', 'piece', "pack", "gram", "ml"]
        },
        value: { 
            type: String, 
            required: true 
        },
        subStock:{
            type: String,
            required:false,
        },
    },
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variantSchema' }] 
}, { timestamps: true });



module.exports = mongoose.model("product", productSchema);
