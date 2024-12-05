const User = require("../Models/userModel.js");
const asynchandler = require("express-async-handler");
const cloudinary = require("../Utils/cloudinary.js");
const {
  successResponse,
  errorResponse,
  internalServerError,
  notFoundError,
  validationError,
} = require("../Utils/resHandler");
const fs = require("fs");
  const Order = require("../Models/orderModel.js");
 const Product = require("../Models/productModel.js");
const { default: mongoose } = require("mongoose");
 
// Admin login functionality
const loginAdmin = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  try {
     const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

     const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

     const token = user.getJWTToken();

     return successResponse(
      res,
      {
        token,
        user,
      },
      "Admin login successful"
    );
  } catch (error) {
    return internalServerError(res, error.message);
  }
});

 const getAllUsers = asynchandler(async (req, res) => {
  try {
     const users = await User.find();

    if (!users || users.length === 0) {
      return errorResponse(res, "No users found", 404);
    }

    return successResponse(res, { users }, "Users fetched successfully");
  } catch (error) {
    return internalServerError(res, error.message);
  }
});

 const deleteUser = asynchandler(async (req, res) => {
  const { id } = req.params;

  try {
     const user = await User.findByIdAndDelete(id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, {}, "User deleted successfully");
  } catch (error) {
    return internalServerError(res, error.message);
  }
});

 
 
// Product
 const addProduct = asynchandler(async (req, res) => {
   const { name, description, price, rating, sizes } = req.body;

   try {
      if (!name || !description || !price || !rating || !req.file || !sizes) {
       return res
         .status(400)
         .json({ success: false, message: "All fields are required" });
     }

      const existingProduct = await Product.findOne({ name });
     if (existingProduct) {
       return res
         .status(400)
         .json({
           success: false,
           message: "Product with this name already exists",
         });
     }

      const parsedSizes = JSON.parse(sizes);  
     if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
       return res
         .status(400)
         .json({ success: false, message: "Sizes must be a non-empty array" });
     }

      let uploadResult;
     try {
       uploadResult = await cloudinary.uploader.upload(req.file.path, {
         folder: "products",  
       });
     } catch (uploadError) {
       console.error("Cloudinary upload error:", uploadError);
       return res
         .status(500)
         .json({ success: false, message: "Image upload failed" });
     } finally {
        fs.unlinkSync(req.file.path);
     }

      const product = new Product({
       name,
       description,
       price,
       rating,
       image: uploadResult.secure_url,  
       sizes: parsedSizes,
     });

     await product.save();

      return res.status(201).json({
       success: true,
       message: "Product added successfully",
       data: product,
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
         message: "An error occurred while adding the product",
       });
   }
 });

const updateProduct = asynchandler(async (req, res) => {
  const { name, description, price, rating, sizes } = req.body;
  const productId = req.params.id;

  try {
     const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

     if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (rating !== undefined) product.rating = rating;

     if (sizes) {
      const parsedSizes = JSON.parse(sizes);  
      if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Sizes must be a non-empty array" });
      }
      product.sizes = parsedSizes;
    }

     let uploadResult;
    if (req.file) {
       try {
        uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "products", 
        });

         const oldImage = product.image.split("/").pop().split(".")[0];  
        await cloudinary.uploader.destroy(oldImage);  

         fs.unlinkSync(req.file.path);

         product.image = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    }

     await product.save();

     return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
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
        message: "An error occurred while updating the product",
      });
  }
});

const deleteProduct = asynchandler(async (req, res) => {
  const productId = req.params.id;

  try {
     const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

     if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; 
      await cloudinary.uploader.destroy(publicId);  
    }

     await product.deleteOne();

     return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product
    });
  } catch (error) {
     console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while deleting the product",
      });
  }
});
  
const getAllProducts = asynchandler(async (req, res) => {
  try {
     const products = await Product.find().sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

     return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while retrieving the products",
      });
  }
});

 const getSingleProduct = asynchandler(async (req, res) => {
   const productId = req.params.productId; // Corrected to match route parameter name

   // Check if productId is a valid ObjectId
   if (!mongoose.Types.ObjectId.isValid(productId)) {
     return res
       .status(400)
       .json({ success: false, message: "Invalid product ID" });
   }

   try {
     const product = await Product.findById(productId);
     if (!product) {
       return res
         .status(404)
         .json({ success: false, message: "Product not found" });
     }

     return res.status(200).json({
       success: true,
       message: "Product retrieved successfully",
       data: product,
     });
   } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: "An error occurred while retrieving the product",
     });
   }
 });



// orders

 const getAllUsersOrdersByAdmin = asynchandler(async (req, res) => {
   try {
      const orders = await Order.find({})
       .populate("user", "name email")  
       .populate("products.product")  
       .sort({ createdAt: -1 })  
       .exec();

     if (!orders || orders.length === 0) {
       return res.status(404).json({
         success: false,
         message: "No orders found.",
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


const changeOrderStatusByAdmin = asynchandler(async (req, res) => {
  const { orderId, status } = req.body;  
  const allowedStatuses = ["Pending", "Shipped", "Delivered"];  

  try {
     if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

     const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

     order.status = status;

     await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the order status",
    });
  }
});

 

 
module.exports = {
  loginAdmin,
  getAllUsers,
  deleteUser,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  getAllUsersOrdersByAdmin,
    changeOrderStatusByAdmin
   };
