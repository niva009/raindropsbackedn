const addressSchema = require("../models/addressSchema");



const addAddress = async (req, res) => {
    try {
        const { userId } = req.user;
        const { houseName, pinCode, landMark, address, phoneNumber } = req.body;

        if (!houseName || !pinCode || !landMark || !address || !phoneNumber) {
            return res.status(400).json({
                message: "All the fields are required",
                success: false,
                error: true,
            });
        }
        const addressData = new addressSchema({
            houseName,
            pinCode,
            landMark,
            address,
            userId: userId,
            phoneNumber,
        });


        await addressData.save();

        return res.status(200).json({
            message: "Address added successfully",
            success: true,
            error: false,
        });
    } catch (error) {
        // Catch any errors and return a proper response
        console.error("Error adding address:", error);
        return res.status(500).json({
            message: "Network error",
            success: false,
            error: true,
        });
    }
};



const deleteAddress = async ( req, res) =>{


    try  {
    const id = req.params.id;

    if(!id){
        return res.status(401).json({message:"id is required", success: false, error: true})
    }

    const deleteAddress = await addressSchema.findByIdAndDelete({_id: id})

    if(!deleteAddress){
        return res.status(400).json({
            message:"address is not present pls try again",
            success: false,
            error: error,
            error: true,
        })

    }
    return res.status(200).json({
        message:"delete address successfull",
        success: true,
        error: false,
    })
}catch(error){
        return res.status(500).json({message:"network issue",error:error })
    }
}


const updateAddress = async (req, res) => {
    try {
        const id = req.params.id;

        console.log("update address..:", id);

        if (!id) {
            return res.status(401).json({
                message: "address id not found",
                error: true,
                success: false,
            });
        }

        const { houseName, pinCode, address, phoneNumber, landMark } = req.body;

        const updateData = {
            ...(houseName && { houseName }),
            ...(pinCode && { pinCode }),
            ...(address && { address }),
            ...(phoneNumber && { phoneNumber }),
            ...(landMark && { landMark }),
        };

        const updatedAddress = await addressSchema.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedAddress) {
            return res.status(401).json({
                message: "address not found",
                success: false,
                error: true,
            });
        }

        return res.status(200).json({
            message: "address updated successfully",
            success: true,
            error: false,
            data: updatedAddress,
        });
    } catch (error) {
        console.error("Error updating address:", error);
        return res.status(500).json({
            message: "network error",
            error: error.message,
        });
    }
};

const viewAddress = async (req, res) => {
    try {
        const { userId } = req.user;

        // Await the result of the asynchronous find operation
        const addressInformation = await addressSchema.find({ userId: userId });

        // Check if no addresses are found
        if (addressInformation.length === 0) {
            return res.status(404).json({
                message: "No address found",
                success: false,
                error: true,
            });
        }

        // Return success response with the fetched data
        return res.status(200).json({
            message: "Customer data fetched successfully",
            data: addressInformation,
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error fetching address:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
};

const viewUserAddress = async (req, res) => {
    try {
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({
          message: "Address ID not found",
          success: false,
          error: true,
        });
      }
  
      // Ensure you pass an object as the filter
      const viewAddress = await addressSchema.find({ _id: id });
  
      if (!viewAddress || viewAddress.length === 0) {
        return res.status(404).json({
          message: "Address not found",
          success: false,
          error: true,
        });
      }
  
      return res.status(200).json({
        message: "Address found",
        success: true,
        error: false,
        data: viewAddress,
      });
    } catch (error) {
      console.error("Error showing address", error);
      return res.status(500).json({
        message: "An error occurred",
        success: false,
        error: true,
      });
    }
  };
  



module.exports = {addAddress,deleteAddress,updateAddress,viewAddress,viewUserAddress};