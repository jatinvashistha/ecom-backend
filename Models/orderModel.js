 const mongoose = require("mongoose");
 const { Schema } = mongoose;

 const orderSchema = new Schema(
   {
     user: {
       type: Schema.Types.ObjectId,
       ref: "User",  
       required: true,
     },
     products: [
       {
         product: {
           type: Schema.Types.ObjectId,
           ref: "Product", 
           required: true,
         },
         quantity: {
           type: Number,
           required: true,
         },
         size: {
           type: String,
           required: true,
         },
         price: {
           type: Number,
           required: true,
         },
       },
     ],
     totalAmount: {
       type: Number,
       required: true, 
     },
     paymentMethod: {
       type: String,
       enum: ["COD", "Online"], 
       default: "COD",  
     },
     status: {
       type: String,
       enum: ["Pending", "Shipped", "Delivered"],
       default: "Pending",
     },
     shippingAddress: {
       type: String,
       required: true,
     },
   },
   {
     timestamps: true,  
   }
 );

 const Order = mongoose.model("Order", orderSchema);

 module.exports = Order;
