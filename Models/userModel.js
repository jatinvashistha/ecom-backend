require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

 const UserSchema = new mongoose.Schema(
   {
     name: { type: String, required: [true, "name is required"] },
    
     email: {
       type: String,
       required: [true, "Please enter your email"],
       unique: true,
       validate: [validator.isEmail, "Please enter a valid email"],
     },
     password: {
       type: String,
       required: [true, "Please enter your password"],
       minLength: [6, "Password must be at least 6 characters"],
     },
     role: {
       type: String,
       enum: ["admin", "user"],
       default: "user",
     },
     cart: [
       {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Property",
       },
     ],
     

     orders: [
      
       {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Order",
       },
     ],
   },
   {
     timestamps: true,
   }
 );


 UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

 UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

 
UserSchema.methods.getJWTToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};


module.exports = mongoose.model("User", UserSchema);
