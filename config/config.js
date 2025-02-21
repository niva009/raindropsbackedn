const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;


console.log("MONGO_URI:", process.env.MONGO_URI); 


const connectDb = async() =>{
    try{
        mongoose.connect("mongodb+srv://pranavpradeepe:i5ZxvHh96YWh6dVw@cluster0.exout.mongodb.net/rain_frops?retryWrites=true&w=majority&appName=Cluster0",{
        })
        console.log("db connection success")
    } catch(error){
        console.log("database connection error", error);
    }
}

module.exports = connectDb;


