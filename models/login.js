const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const LoginSchema = Schema ({
    email:{
        type:String,
        required: true,
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userRegistration',
        required: true,
    },
    password:{
        type :String,
    },
    role:{
        type:String,
        require:true,
        default: 1,
    },
})

module.exports = mongoose.model("login",LoginSchema);