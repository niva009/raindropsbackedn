const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.dbURI;

const connectDb = async() =>{
    try{
        mongoose.connect(dbUrl,{
        })
        console.log("db connection success")
    } catch(error){
        console.log("database connection error", error);
    }
}

module.exports = connectDb;


