const orderSchema = require('../models/orderSchema');
const addressSchema = require('../models/addressSchema');
const cartSchema = require('../models/cartSchema');
const Razorpay = require('razorpay'); 
const crypto = require('crypto');
const { error } = require('console');


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,  
    key_secret: process.env.RAZORPAY_KEY_SECRET,  
});

const orderCreation = async (req, res) => {
    try {
        const { userId } = req.user;
        const { couponCode, addressId, paymentType, totalAmount } = req.body;
        console.log("addressID", addressId);
        console.log("Payment-type", paymentType);

        console.log("order information", req.body);


        if (!addressId || !paymentType) {
            return res.status(400).json({
                message: "addressId and paymentType are required",
                success: false,
                error: true,
            });
        }


        const validateAddress = await addressSchema.findById(addressId);
        if (!validateAddress) {
            return res.status(404).json({
                message: "Address not valid or please select a valid address",
                success: false,
                error: true,
            });
        }



        const productInformation = await cartSchema.find({ userId });

        console.log("product infoo", productInformation);
        console.log("userid..:", userId);

        if (!productInformation || productInformation.length === 0) {
            return res.status(400).json({
                message: "Order failed, cart is empty",
                success: false,
                error: true,
            });
        }


        if (paymentType === 'COD') {
            const newOrder = new orderSchema({
                productInformation: productInformation.map(item => ({
                    name: item.name,
                    price: item.price || 0,
                    sale_price: item.sale_price,
                    discount: item.discount || 0,
                    image: item.image || "undefined",
                    userId: item.userId,
                    companyId: item.companyId,
                    category: item.category,
                    productId: item.productId,
                    categoryname: item.categoryname,
                    slug: item.slug || "",
                    quantity: item.quantity || 1,
                })),
                couponCode: couponCode || null,
                payment_type: paymentType,
                paymentId: null, 
                addressId: addressId,
                totalAmount: totalAmount || 0,
            });

            await newOrder.save();

            await cartSchema.deleteMany({ userId: userId });

            return res.status(200).json({
                message: "Order created successfully",
                success: true,
                error: false,
                data: newOrder,
            });
        }


        if (paymentType === 'Razorpay') {

            const razorpayOrderOptions = {
                amount: parseFloat(totalAmount) * 100, 
                currency: 'INR',
                receipt: `order_rcptid_${new Date().getTime()}`,
                payment_capture: 1, 
            };

            const razorpayOrder = await razorpayInstance.orders.create(razorpayOrderOptions);

            console.log("razorpayOrder response..:", razorpayOrder);
            
    
            if (!razorpayOrder || razorpayOrder.status !== 'created') {
                return res.status(500).json({
                    message: "Failed to create Razorpay order",
                    success: false,
                    error: true,
                });
            }
            const newOrder = new orderSchema({
                productInformation: productInformation.map(item => ({
                    name: item.name,
                    price: item.price || 0,
                    sale_price: item.sale_price,
                    discount: item.discount || 0,
                    image: item.image || "undefined",
                    userId: item.userId,
                    category: item.category,
                    productId: item.productId,
                    categoryname: item.categoryname,
                    slug: item.slug || "",
                    quantity: item.quantity || 1,
                })),
                couponCode: couponCode || null,
                payment_type: paymentType,
                paymentId: razorpayOrder.id, 
                addressId: addressId,
                totalAmount: totalAmount,
            });

            // Save the order in the database
            await newOrder.save();
            await cartSchema.deleteMany({ userId: userId });

            return res.status(200).json({
                message: "Order created successfully. Please proceed to payment.",
                success: true,
                error: false,
                data: {
                    orderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    key_id: razorpayInstance.key_id,
                    orderReceipt: razorpayOrder.receipt,
                    orderStatus: razorpayOrder.status,
                },
            });
        }

        return res.status(400).json({
            message: "Invalid payment type",
            success: false,
            error: true,
        });

    } catch (error) {
        console.log("Order creation error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message || error,
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { payment_id, order_id, signature } = req.body;

        console.log("verify payment data..:", payment_id, order_id, signature);
        
        const body = order_id + "|" + payment_id;  // Prepare the string to be hashed
        const expected_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)  // Your Razorpay secret key
            .update(body)
            .digest('hex');
        
        if (expected_signature === signature) {

            const order = await orderSchema.findOne({ paymentId: order_id });

            if (!order) {
                return res.status(400).json({
                    message: "Order not found for the given order ID",
                    success: false,
                    error: true,
                });
            }

  
            order.paymentStatus = 'Paid';  
            order.paymentId = payment_id;
            await order.save();

            return res.status(200).json({
                message: "Payment verified successfully",
                success: true,
            });
        } else {
            return res.status(400).json({
                message: "Payment verification failed",
                success: false,
                error: true,
            });
        }
    } catch (error) {
        console.log("Payment verification error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message || error,
        });
    }
};

const userOrderHistory = async (req, res) => {
    try {
        const { userId } = req.user;

        console.log("IDDDDDDDDD", req.body);

        console.log("useriD in order history", userId);
  
      if (!userId) {
        return res.status(400).json({
          message: "Authorization failed. Please login",
          success: false,
          error: true,
        });
      }
  
      const arrayResponse = await orderSchema.find({ "productInformation.userId": userId });
  

      if (!arrayResponse || arrayResponse.length === 0) {
        return res.status(404).json({
          message: "No orders found",
          success: false,
          error: true,
        });
      }
  
      return res.status(200).json({
        message: "Order details fetched successfully",
        success: true,
        error: false,
        data: arrayResponse,
      });
  
    } catch (error) {
      console.log("Error fetching user order history:", error);
      return res.status(500).json({
        message: "Network error",
        success: false,
        error: true,
      });
    }
  };

const showVendorOrders = async (req, res) => {
    try {
        const { userId } = req.user;
        console.log("User ID:", userId);

        if (!userId) {
            return res.status(400).json({
                message: "Token expired. Please log in.",
                success: false,
                error: true,
            });
        }

        // Fetch orders where at least one product's companyId matches the userId
        const vendorOrders = await orderSchema.find({
            "productInformation.companyId": userId
        });

        console.log("Order Details:", vendorOrders);

        // Check if any orders exist
        if (!vendorOrders || vendorOrders.length === 0) {
            return res.status(404).json({
                message: "No orders found for this vendor.",
                success: false,
                error: true,
            });
        }

        // Filter products within each order to include only those matching the companyId
        const filteredOrders = vendorOrders
            .map(order => {
                const filteredProducts = order.productInformation.filter(
                    product => product.companyId.toString() === userId
                );

                // Return the order with filtered products
                return {
                    ...order._doc, // Include other order details
                    productInformation: filteredProducts, // Replace with filtered products
                };
            })
            .filter(order => order.productInformation.length > 0); // Only include orders with matching products

        // Respond with the filtered orders
        return res.status(200).json({
            message: "Order details retrieved successfully.",
            data: filteredOrders,
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error fetching vendor orders:", error);
        return res.status(500).json({
            message: "An error occurred while fetching vendor orders.",
            success: false,
            error: true,
        });
    }
};

const orderUpdateAccepted = async (req, res) => {
    try {
      const { userId } = req.user;
      const { orderId } = req.body;
  
      console.log("orderid..:", orderId, "userid..:", userId);
  
      if (!userId || !orderId) {
        return res.status(404).json({
          message: "userid and orderid not found",
          success: false,
          error: true,
        });
      }
  
      const orderDetails = await orderSchema.findOne({ _id: orderId });
  
      if (!orderDetails) {
        return res.status(400).json({
          message: "orders not found",
          success: false,
          error: true,
        });
      }
  
      console.log("orderDetails", orderDetails);
  
      const { productInformation } = orderDetails;
  
      if (!productInformation || productInformation.length === 0) {
        return res.status(400).json({
          message: "No products found in the order",
          success: false,
          error: true,
        });
      }
  

      let updated = false;
      for (const product of productInformation) {
        if (product.companyId.toString() === userId) {
          product.isStatus = "accepted"; // Update the status
          updated = true;
        }
      }
  
      if (updated) {
        await orderDetails.save();
        return res.status(200).json({
          message: "Order updated successfully",
          success: true,
          error: false,
          data: productInformation,
        });
      } else {
        return res.status(400).json({
          message: "No products matched the userId",
          success: false,
          error: true,
        });
      }
    } catch (error) {
      console.log("error", error);
  
      return res.status(500).json({
        message: "Error updating order product",
        success: false,
        error: true,
      });
    }
  };
  

  const orderUpdateDelivered = async (req, res) => {
    try {
      const { userId } = req.user;
      const { orderId } = req.body;
  
      console.log("orderid..:", orderId, "userid..:", userId);
  
      if (!userId || !orderId) {
        return res.status(404).json({
          message: "userid and orderid not found",
          success: false,
          error: true,
        });
      }
  
      const orderDetails = await orderSchema.findOne({ _id: orderId });
  
      if (!orderDetails) {
        return res.status(400).json({
          message: "orders not found",
          success: false,
          error: true,
        });
      }
  
      console.log("orderDetails", orderDetails);
  
      const { productInformation } = orderDetails;
  
      if (!productInformation || productInformation.length === 0) {
        return res.status(400).json({
          message: "No products found in the order",
          success: false,
          error: true,
        });
      }
  

      let updated = false;
      for (const product of productInformation) {
        if (product.companyId.toString() === userId) {
          product.isStatus = "delivered"; // Update the status
          updated = true;
        }
      }
  
      if (updated) {
        await orderDetails.save();
        return res.status(200).json({
          message: "Order updated successfully",
          success: true,
          error: false,
          data: productInformation,
        });
      } else {
        return res.status(400).json({
          message: "No products matched the userId",
          success: false,
          error: true,
        });
      }
    } catch (error) {
      console.log("error", error);
  
      return res.status(500).json({
        message: "Error updating order product",
        success: false,
        error: true,
      });
    }
  };



  ///specifi order based on id///


  const orderById = async(req, res) =>{

    try {
      const orderId = req.params.id;
      if(!orderId){
        return res.status(400).json({
          message:"order id is required",
          success:false,
          error:true
        })
      }
      const orderDetails = await orderSchema.findById(orderId);

      if(orderDetails){
        return res.status(200).json({
          message:`order details foundsuccess ${orderId}`,
          data: orderDetails,
          success: true,
          error: false,
        })
      }
      else{
        return res.status(404).json({
          message:`order details not found ${orderId}`,
          success:false,
          error: true
        })
      }
    }catch(error){
      console.log("error orders", error);
      return res.statu(500).json({
        message:"internal server error",
        success: false,
        error: true,   
      })
    }
  }


  ///////count specif order status deliverdddddd.......////

  const showVendorDeliveredOrders = async (req, res) => {
    try {
      const { userId } = req.user;
      console.log("User ID:", userId);
  
      if (!userId) {
        return res.status(400).json({
          message: "Token expired. Please log in.",
          success: false,
          error: true,
        });
      }
  
      // Fetch orders where at least one product's companyId matches the userId and status is delivered
      const deliveredOrders = await orderSchema.find({
        "productInformation.companyId": userId,
        "productInformation.isStatus": "delivered", 
      });
  
      console.log("Delivered Orders:", deliveredOrders);
  
      // Check if any delivered orders exist
      if (!deliveredOrders || deliveredOrders.length === 0) {
        return res.status(404).json({
          message: "No delivered orders found for this vendor.",
          success: false,
          error: true,
        });
      }
  
      // Count the delivered orders
      const deliveredOrderCount = deliveredOrders.length;
  
      // Respond with the count and details
      return res.status(200).json({
        message: "Delivered orders retrieved successfully.",
        data: {
          count: deliveredOrderCount,
          orders: deliveredOrders,
        },
        success: true,
        error: false,
      });
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
      return res.status(500).json({
        message: "An error occurred while fetching delivered orders.",
        success: false,
        error: true,
      });
    }
  };
  



  
  


module.exports = { orderCreation ,verifyPayment,orderById, userOrderHistory,showVendorOrders,orderUpdateAccepted,orderUpdateDelivered,showVendorDeliveredOrders};
