const categorySchema = require('../models/category');

const addCategory = async (req, res) => {
    try {
        const { name, metatitle, metadescription, isActive } = req.body;
        const image = req.file ? `${req.file.filename}` : null;

        if (!name || !image) {
            return res.status(400).json({ message: "Name and image are required fields." });
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

        const oldCategory = await categorySchema.findOne({ name });
        if (oldCategory) {
            return res.status(400).json({ message: "Category name already exists." });
        }


        const category = new categorySchema({
            name,
            image,
            slug,
            metatitle,
            metadescription,
            isActive: isActive !== undefined ? isActive : true,
        });

        await category.save();
        return res.status(201).json({ message: "Category added successfully.", data: category });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ message: "Failed to add category.", error });
    }
};




const viewcategory = async(req,res) =>{

    try{
        const categoryname = req.params.name;

       const category = await categorySchema.findOne({ name: categoryname});

       if(category){
        return res.status(200).json({message:"category found successfully", data:category,success:true,error:false});
       }
                 
    }catch(error){
         return res.status(500).json({message:"category not found" , error:error});
    }
}

const deletecategory = async(req,res) =>{

    try{
        const categoryid = req.params.id;

        console.log(categoryid);

        const category = await categorySchema.findByIdAndDelete({_id:categoryid});
        
        if(category){
            return res.status(200).json({message:"category deleted successfully",success:true,error:false ,id:category});
        }else{
            return res.status(404).json({message:"category not found",success:false,error:true});
        }
    }catch(error){
         return res.status(500).json({message:"Failed to delete category.",error});
    }
}


const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        console.log("Category ID:", categoryId);

        const { name, slug, metatitle, metadescription } = req.body;
        console.log(req.body);
        const image = req.file ? `${req.file.filename}` : undefined;

        // Validate required fields
        if (!name || !slug) {
            return res.status(400).json({ message: "Please fill in both name and slug", success: false, error: true });
        }

        // Prepare the update data
        const updateData = {
            ...(name && { name }),
            ...(slug && { slug }),
            ...(metatitle && { metatitle }),
            ...(metadescription && { metadescription }),
            ...(image && { image })
        };

        // Update the category by its ID
        const updatedCategory = await categorySchema.findByIdAndUpdate(categoryId, updateData, {
            new: true, // Return the updated document
            runValidators: true // Validate fields before updating
        });

        // Check if the category was found and updated
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found", success: false, error: true });
        }

        // If updated successfully, send a response
         return res.status(200).json({ message: "Category updated successfully", success: true, error: false, data: updatedCategory });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update category.", error });
    }
};

const viwaAllData = async (req, res) => {
    try {
        const response = await categorySchema.find();

        console.log("All categories:", response);

        if (!response || response.length === 0) {
            return res.status(404).json({ message: "No categories found", success: false });
        }

        return res.status(200).json({ message: "All category info", data: response, success: true });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: "Server error", error: error.message, success: false });
    }
};




module.exports = {
    addCategory,
    viewcategory,
    deletecategory,
    updateCategory,
    viwaAllData
};