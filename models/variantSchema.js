const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const variantSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
    sale_price: { type: Number, required: true }, 
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId , ref:'Category', required: true},
    categoryname: { type: String, required: true },
    stock: { type: Number, required: true }, 
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    slug:{ type:String, required: true},
    type: { type: String, default: "variantProduct" },
    productAttribute: {
        type: {
            type: String, 
            required: true, 
            enum: ['weight', 'liter', 'piece']
        },
        value: { 
            type: Number, 
            required: true 
        }
    }
});




module.exports = mongoose.model("Variant", variantSchema);
