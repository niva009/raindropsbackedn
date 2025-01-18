const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userRegistration = Schema({
    name: {
        type: String,
    },
    email:{
        type: String,
        required: false,
        unique: true
    },
    password:{
        type: String,
        required: false,
    },
    phone_number:{
        type: String
    }
},{timestamp:true})

module.exports = mongoose.model('userRegistration', userRegistration);