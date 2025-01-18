const bannerSchema = require('../models/bannerSchema');
const Banner = require('../models/bannerSchema');
const videobanner = require('../models/videobanner');
const videoBanner = require("../models/videobanner")

const addBanner = async (req, res) => {
    try {
        const { name ,url} = req.body;

        if ( !req.file){
            return res.status(400).json({ message: 'images are required' });
        }

        const image = req.file ? `${req.file.filename}` : undefined;
        const banner = new Banner({
            name: name || "Untitled", 
            url: url || "undefined", 
            image: image,

        });

        await banner.save();

        res.status(200).json({
            message: 'Banner added successfully',
            data: banner,
        });
    } catch (error) {
        console.error('Error adding banner:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};


const deleteBanner = async ( req, res ) =>{

    try{
            const id = req.params.id,

             bannerData = await bannerSchema.findByIdAndDelete({_id: id})

            if(!bannerData){
                return res.status(401).json({ message:"no such banner exist", success: true, error: fasle});
            }

            res.status(200).json({message:"bnner deelted successfully", succes: true , error: false})
    }
    catch(error){
        res.status(500).json({message:"banner delete error",error});
    }
}

const viewBanner = async (req, res) => {
    try {
        // Fetch all banners from the database
        const bannerImages = await bannerSchema.find().select('-name');

        // Check if banners are found
        if (bannerImages.length > 0) {
            res.status(200).json({
                message: "Banner images fetched successfully",
                data: bannerImages, // Include the fetched banner data
                success: true,
                error: false,
            });
        } else {
            res.status(404).json({
                message: "No banners found",
                data: [],
                success: false,
                error: false,
            });
        }
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false,
            error: true,
        });
    }
};

const updateBanner = async (req, res) => {
    try {
        const id = req.params.id;  
        const { name, url, image } = req.body;  


        const updatedBanner = await Banner.findByIdAndUpdate(
            id,  
            { 
                $set: { 
                    name: name,  
                    url: url,    
                    image: image 
                }
            },
            { new: true }  
        );

        if (!updatedBanner) {
            return res.status(404).json({ message: 'Banner not found', success: false });
        }

        res.status(200).json({
            message: 'Banner updated successfully',
            data: updatedBanner,
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'An error occurred', success: false, error: true });
    }
};

const addVideoBanner = async (req, res) => {
    try {

        const { name, url } = req.body;

        const video = req.file ? req.file.filename : null;

        if (!video) {
            return res.status(400).json({ message: 'Video file is required', success: false, error: true });
        }

        const videoBanner = new videobanner({
            name,
            url,
            video
        });


        await videoBanner.save();


        res.status(200).json({
            message: "Video banner added successfully",
            success: true,
            error: false,
            data: videoBanner,
        });
    } catch (error) {
        console.error('Error adding video banner:', error);
        res.status(500).json({ message: 'An error occurred', success: false, error: true });
    }
};


const deleteVideobanner = async(req, res) =>{

    try{ 

        const id = req.params.id;

        const videoProduct = await videoBanner.findByIdAndDelete({_id: id})

        if(!videoProduct){
            return res.status(400).json(
                {
                    message:"video not found",
                    succes: false,
                    error: true,
                }
            )
        }
        res.status(200).json({message:"video deleted successfully"});
    }catch(error){
        res.status(500).json({
            message:"internal server error",
            success: true,
            error: false,
        })
    }
}

const showVideoBanner = async ( req, res) =>{

    try {

        const videoBanner =  await videobanner.find().select('-name');
        if(!videobanner){
            return res.status(401).json({ message:"video not found", success: false, errro: true});
        }
         res.status(200).json({message:"video bannners", data: videoBanner, success: true, error: false})
    }
     catch(error){
        res.status(500).json({message:"internal server error", error: error})
     }
}



module.exports = { addBanner, deleteBanner, viewBanner ,updateBanner, addVideoBanner,deleteVideobanner, showVideoBanner};
