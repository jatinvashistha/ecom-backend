const User = require("../Models/userModel.js");
const bcrypt = require("bcryptjs");
 const {
  successResponse,
   internalServerError,
  notFoundError,  
} = require("../Utils/resHandler.js");
const asynchandler = require("express-async-handler");
const Cart = require("../Models/cartModel.js")
 const Order = require("../Models/orderModel.js");
const Product = require("../Models/productModel.js");

// Create a new user
 const createUser = asynchandler(async (req, res) => {
   const { name, email, password, role } = req.body;

   try {
      if (!name || !email || !password) {
       return res
         .status(400)
         .json({ success: false, message: "All fields are required" });
     }

      if (role && !["admin", "user"].includes(role)) {
       return res.status(400).json({ success: false, message: "Invalid role" });
     }

      const existingUser = await User.findOne({ email });
     if (existingUser) {
       return res
         .status(400)
         .json({
           success: false,
           message: "User with this email already exists",
         });
     }

      const newUser = new User({
       name,
       email,
       password,  
       role: role || "user", 
     });

      await newUser.save();

      const userResponse = {
       id: newUser._id,
       name: newUser.name,
       email: newUser.email,
       role: newUser.role,
       createdAt: newUser.createdAt,
       updatedAt: newUser.updatedAt,
     };

     return res
       .status(201)
       .json({
         success: true,
         message: "User created successfully",
         data: userResponse,
       });
   } catch (error) {
      if (error.name === "ValidationError") {
       const messages = Object.values(error.errors).map((val) => val.message);
       return res
         .status(400)
         .json({ success: false, message: messages.join(", ") });
     }

      console.error(error);
     return res
       .status(500)
       .json({
         success: false,
         message: "An error occurred while creating the user",
       });
   }
 });

// User login
 
const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  try {
     if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

     const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

     const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

     const token = user.getJWTToken();

     const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

     return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
     console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during login" });
  }
});

// Get all users
const getUsers = asynchandler(async (req, res) => {
  try {
    const users = await User.find();
    return successResponse(res, users, "Users retrieved successfully");
  } catch (error) {
    return internalServerError(res, error.message);
  }
});

// Get a single user by ID
const getUserById = asynchandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFoundError(res, "User not found");
    return successResponse(res, user, "User retrieved successfully");
  } catch (error) {
    return internalServerError(res, error.message);
  }
});

// Update a user
 const updateUser = asynchandler(async (req, res) => {
   try {
     const { name, email, password, role } = req.body;

      const user = await User.findById(req.params.id);
     if (!user) {
       return res
         .status(404)
         .json({ success: false, message: "User not found" });
     }

      if (name) user.name = name;
     if (email) {
       const emailExists = await User.findOne({ email });
       if (emailExists && emailExists._id.toString() !== req.params.id) {
         return res
           .status(400)
           .json({ success: false, message: "Email is already in use" });
       }
       user.email = email;
     }
     if (password) user.password = await bcrypt.hash(password, 10);
     if (role) {
       if (!["admin", "user"].includes(role)) {
         return res
           .status(400)
           .json({ success: false, message: "Invalid role provided" });
       }
       user.role = role;
     }

      await user.save();

      const updatedUser = {
       id: user._id,
       name: user.name,
       email: user.email,
       role: user.role,
       cart: user.cart,
       orders: user.orders,
       createdAt: user.createdAt,
       updatedAt: user.updatedAt,
     };

     return res.status(200).json({
       success: true,
       message: "User updated successfully",
       data: updatedUser,
     });
   } catch (error) {
     console.error(error);

      if (error.name === "ValidationError") {
       const messages = Object.values(error.errors).map((val) => val.message);
       return res
         .status(400)
         .json({ success: false, message: messages.join(", ") });
     }

     return res
       .status(500)
       .json({
         success: false,
         message: "An error occurred while updating the user",
       });
   }
 });
 

 // Cart controllers
 const addToCartProduct = asynchandler(async (req, res) => {
   const { productId, quantity, size } = req.body;
   const userId = req.user._id;  

   try {
      const product = await Product.findById(productId);

     if (!product) {
       return res
         .status(404)
         .json({ success: false, message: "Product not found" });
     }

      const sizeOption = product.sizes.find(
       (sizeOption) => sizeOption.size === size
     );

     if (!sizeOption) {
       return res.status(400).json({
         success: false,
         message: `Size "${size}" is not available for this product`,
       });
     }

      if (quantity > sizeOption.quantity) {
       return res.status(400).json({
         success: false,
         message: `Not enough stock for size "${size}". Available quantity: ${sizeOption.quantity}`,
       });
     }

      let cartItem = await Cart.findOne({
       user: userId,
       product: productId,
       size,
     });

     if (cartItem) {
        cartItem.quantity += quantity;

        if (cartItem.quantity > sizeOption.quantity) {
         return res.status(400).json({
           success: false,
           message: `Not enough stock for size "${size}". Available quantity: ${sizeOption.quantity}`,
         });
       }

        cartItem.price = product.price * cartItem.quantity;

        await cartItem.save();

        await User.findByIdAndUpdate(userId, {
         $addToSet: { cart: cartItem._id },  
       });

       return res.status(200).json({
         success: true,
         message: "Cart updated successfully",
         data: cartItem,
       });
     }

      const price = product.price * quantity;

      const newCartItem = new Cart({
       user: userId,
       product: productId,
       quantity,
       size,
       price,
     });

      await newCartItem.save();

      await User.findByIdAndUpdate(userId, {
       $addToSet: { cart: newCartItem._id },  
     });

     return res.status(201).json({
       success: true,
       message: "Product added to cart successfully",
       data: newCartItem,
     });
   } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: "An error occurred while adding the product to the cart",
     });
   }
 });

 const removeProductFromCart = asynchandler(async (req, res) => {
   const { productId, size } = req.body;
   const userId = req.user._id; 
   try {
      const cartItem = await Cart.findOne({
       user: userId,
       product: productId,
       size,
     });

     if (!cartItem) {
       return res.status(404).json({
         success: false,
         message: "Cart item not found",
       });
     }

      await Cart.findByIdAndDelete(cartItem._id);

      await User.findByIdAndUpdate(userId, {
       $pull: { cart: cartItem._id },  
     });

     return res.status(200).json({
       success: true,
       message: "Product removed from cart successfully",
     });
   } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: "An error occurred while removing the product from the cart",
     });
   }
 });
  
 const getMyCartProducts = asynchandler(async (req, res) => {
      const userId = req.user._id;  
       try {
         const cartItems = await Cart.find({ user: userId })
          .populate({
            path: "product",
            select: "name price image",  
          })
          .populate({
            path: "user",
            select: "name email",  
          });

         if (!cartItems.length) {
          return res.status(404).json({
            success: false,
            message: "No items found in your cart",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Cart products retrieved successfully",
          data: cartItems,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching cart products",
        });
      }
 });

 
// Order
 
 const buyNow = asynchandler(async (req, res) => {
   const { productId, quantity, size, shippingAddress, paymentMethod } =
     req.body;
   const userId = req.user._id;  

   try {
     const product = await Product.findById(productId);

     if (!product) {
       return res
         .status(404)
         .json({ success: false, message: "Product not found" });
     }

     const sizeOption = product.sizes.find(
       (sizeOption) => sizeOption.size === size
     );

     if (!sizeOption) {
       return res.status(400).json({
         success: false,
         message: `Size "${size}" is not available for this product`,
       });
     }

     if (quantity > sizeOption.quantity) {
       return res.status(400).json({
         success: false,
         message: `Not enough stock for size "${size}". Available quantity: ${sizeOption.quantity}`,
       });
     }

      const price = product.price * quantity;
     const totalAmount = price;

      const newOrder = new Order({
       user: userId,
       products: [{ product: productId, quantity, size, price }],
       totalAmount,
       paymentMethod: paymentMethod || "COD",  
       shippingAddress,
     });

      await newOrder.save();

      sizeOption.quantity -= quantity;

      await product.save();

      await Cart.findOneAndDelete({ user: userId, product: productId, size });

      await User.findByIdAndUpdate(userId, {
       $push: { orders: newOrder._id }, // Push the new order to the user's orders array
     });

     return res.status(201).json({
       success: true,
       message: "Order placed successfully",
       data: newOrder,
     });
   } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: "An error occurred while placing the order",
     });
   }
 });

  
 const buyFromCart = asynchandler(async (req, res) => {
   const userId = req.user._id;  
   const { shippingAddress, paymentMethod } = req.body;  

   try {
      const cartItems = await Cart.find({ user: userId }).populate("product");

     if (!cartItems || cartItems.length === 0) {
       return res.status(400).json({
         success: false,
         message: "Your cart is empty. Please add products to your cart first.",
       });
     }

     let totalAmount = 0;
     let products = [];

      for (let item of cartItems) {
       const product = item.product;

        const sizeOption = product.sizes.find(
         (sizeOption) => sizeOption.size === item.size
       );

       if (!sizeOption) {
         return res.status(400).json({
           success: false,
           message: `Size "${item.size}" is not available for product "${product.name}".`,
         });
       }

        if (item.quantity > sizeOption.quantity) {
         return res.status(400).json({
           success: false,
           message: `Not enough stock for size "${item.size}". Available quantity: ${sizeOption.quantity}`,
         });
       }

        const price = product.price * item.quantity;
       totalAmount += price;

        products.push({
         product: item.product._id,
         quantity: item.quantity,
         size: item.size,
         price,
       });

        sizeOption.quantity -= item.quantity;

        await product.save();
     }

      const newOrder = new Order({
       user: userId,
       products,
       totalAmount,
       paymentMethod: paymentMethod || "COD", 
       shippingAddress,
     });

      await newOrder.save();

      await User.findByIdAndUpdate(userId, {
       $push: { orders: newOrder._id }, 
     });

      await Cart.deleteMany({ user: userId });

     return res.status(201).json({
       success: true,
       message: "Order placed successfully",
       data: newOrder,
     });
   } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: "An error occurred while placing the order",
     });
   }
 });


  const getAllMyOrders = asynchandler(async (req, res) => {
    const userId = req.user._id;

    try {
      const orders = await Order.find({ user: userId })
        .populate("products.product", "name price image")
        .populate("user", "name email")
        .sort({ createdAt: -1 })  
        .exec();

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found for this user.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the orders",
      });
    }
  });


 
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  // deleteUser,
  addToCartProduct,
   removeProductFromCart,
  getMyCartProducts,
  buyNow,
   buyFromCart,
  getAllMyOrders,
  
};
