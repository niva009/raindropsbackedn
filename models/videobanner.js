const mongoose = require("mongoose");
const {Schema} = mongoose


const videoBannerSchema = new Schema({
    name:{ type: String , require: true},
    slug:{ type: String, required: false},
    video:{ type: String, required: true}
})

module.exports = mongoose.model("videobanner", videoBannerSchema);