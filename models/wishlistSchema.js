const mongoose = require('mongoose');
const Schema = mongoose.Schema

const wishlistSchema = new Schema({

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
    categoryname:{
        type: String,
        required: false,
    },
    slug:{
        type:String,
        required: true,
    },
    stock:{
        type:String,
        required: true,
    }
})

module.exports = mongoose.model("wishlist", wishlistSchema);