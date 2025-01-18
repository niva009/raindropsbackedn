const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const AddressSchema = new Schema ({

    houseName:{
        type: String,
        required: true,
    },
    pinCode:{
        type:Number,
        required: true,
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'userRegistration',
      required: true,
    },
    address:{
         type: String,
         required: true,
    },
    landMark:{
        type: String,
        required: false,
    },
    phoneNumber:{
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model("addressSchema", AddressSchema);