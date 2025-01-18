const mongoose = require("mongoose");
const { Schema } = mongoose;


const bannerSchema =  new Schema ({

    name:{ type: String, required: false},
    url:{ type: String, required:false},
    image:{type: String, required: false}
})

module.exports = mongoose.model("banner", bannerSchema);
