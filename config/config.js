const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();




const connectDb = async() =>{
    try{
        mongoose.connect("mongodb+srv://pranavpradeepe:i5ZxvHh96YWh6dVw@cluster0.exout.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",{
        })
        console.log("db connection success")
    } catch(error){
        console.log("database connection error", error);
    }
}

module.exports = connectDb;


