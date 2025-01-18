const express = require('express');
const locationRouter = express.Router();
const getAddress = require('../controllers/get-location');


locationRouter.post("/get-address",getAddress);


module.exports = locationRouter;