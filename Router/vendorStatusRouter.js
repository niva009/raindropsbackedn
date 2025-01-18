const express = require('express');
const vendorStatsRouter = express.Router();
const authorization = require('../middleware/auth')

const { vendorStatusUpdation, vendorStatus} = require("../controllers/vendorStatusController")


vendorStatsRouter.put("/vendor-status", authorization, vendorStatusUpdation);
vendorStatsRouter.get("/vendor-status", authorization, vendorStatus);


module.exports = vendorStatsRouter