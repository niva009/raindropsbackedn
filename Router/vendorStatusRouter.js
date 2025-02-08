const express = require('express');
const vendorStatsRouter = express.Router();
const authorization = require('../middleware/auth')

const { vendorStatusUpdation, vendorStatus, vendorProducts} = require("../controllers/vendorStatusController")


vendorStatsRouter.put("/vendor-status", authorization, vendorStatusUpdation);
vendorStatsRouter.get("/vendor-status", authorization, vendorStatus);
vendorStatsRouter.get("/vendor-product/:id",  vendorProducts);


module.exports = vendorStatsRouter