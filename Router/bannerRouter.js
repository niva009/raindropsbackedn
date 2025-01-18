const express = require("express");
const bannerRouter = express.Router();
const { addBanner, viewBanner, deleteBanner ,updateBanner,addVideoBanner,deleteVideobanner , showVideoBanner} = require('../controllers/banner');

const upload = require("../middleware/upload");


bannerRouter.post('/add-banner', upload.single('image') ,addBanner)
bannerRouter.get('/viewbanner',viewBanner)
bannerRouter.delete('/deletebanner/:id',deleteBanner)
bannerRouter.put('/updatebanner/:id',updateBanner)
bannerRouter.post('/video/add-banner' ,upload.single('video'),addVideoBanner)
bannerRouter.delete('/video/delete-banner',deleteVideobanner)
bannerRouter.get('/video/banners', showVideoBanner)


module.exports = bannerRouter;