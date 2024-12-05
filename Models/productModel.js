 const mongoose = require("mongoose");
 const { Schema } = mongoose;

 const ProductSchema = new Schema(
   {
     name: {
       type: String,
       required: [true, "Product name is required"],
       unique: true,  
     },
     description: {
       type: String,
       required: [true, "Product description is required"],
     },
     price: {
       type: Number,
       required: [true, "Product price is required"],
       min: [0, "Price must be greater than or equal to 0"],
     },
     rating: {
       type: Number,
       required: [true, "Product rating is required"],
       min: [0, "Rating must be at least 0"],
       max: [5, "Rating cannot exceed 5"],
     },
     image: {
       type: String,
       required: [true, "Image is required"],
     },
     sizes: [
       {
         size: {
           type: String,
           required: [true, "Size is required"],
         },
         quantity: {
           type: Number,
           required: [true, "Quantity is required"],
           min: [0, "Quantity must be greater than or equal to 0"],
         },
       },
     ],
   },
   {
     timestamps: true,
   }
 );

 const Product = mongoose.model("Product", ProductSchema);

 module.exports = Product;
