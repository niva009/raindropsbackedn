const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appliedCoupon =  new Schema({

    couponCode:{
        type: String,
         required: true,
    }, 
    userId:[
        {
            type: String,
            required: true,
            ref: mongoose.Schema.ObjectId,
            ref:'userRegistration',
        }
    ],

})

module.exports = mongoose.model("applied_couponcodes", appliedCoupon);