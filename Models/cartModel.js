 const mongoose = require("mongoose");
 const { Schema } = mongoose;

 const cartSchema = new Schema(
   {
     product: {
       type: Schema.Types.ObjectId,
       ref: "Product", 
       required: true,
     },
     user: {
       type: Schema.Types.ObjectId,
       ref: "User", 
       required: true,
     },
     quantity: {
       type: Number,
       required: true,
       min: [1, "Quantity must be at least 1"],  
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
   {
     timestamps: true, 
   }
 );

  cartSchema.pre("save", async function (next) {
   const product = await mongoose.model("Product").findById(this.product);

   if (!product) {
     return next(new Error("Product not found"));
   }

    const sizeOption = product.sizes.find(
     (sizeOption) => sizeOption.size === this.size
   );

   if (!sizeOption) {
     return next(
       new Error(`Size "${this.size}" is not available for this product`)
     );
   }

    if (this.quantity > sizeOption.quantity) {
     return next(
       new Error(
         `Not enough stock for size "${this.size}". Available quantity: ${sizeOption.quantity}`
       )
     );
   }

    const productPrice = product.price;
   this.price = productPrice * this.quantity;

    next();
 });

  cartSchema.pre("findOneAndUpdate", async function (next) {
   const updatedData = this.getUpdate();
   const productId = updatedData.product || this._conditions.product;

   const product = await mongoose.model("Product").findById(productId);

   if (!product) {
     return next(new Error("Product not found"));
   }

    const sizeOption = product.sizes.find(
     (sizeOption) => sizeOption.size === updatedData.size
   );
   if (!sizeOption) {
     return next(
       new Error(`Size "${updatedData.size}" is not available for this product`)
     );
   }

    if (updatedData.quantity > sizeOption.quantity) {
     return next(
       new Error(
         `Not enough stock for size "${updatedData.size}". Available quantity: ${sizeOption.quantity}`
       )
     );
   }

    const productPrice = product.price;
   updatedData.price = productPrice * updatedData.quantity;

    next();
 });

 const Cart = mongoose.model("Cart", cartSchema); 

 module.exports = Cart;
