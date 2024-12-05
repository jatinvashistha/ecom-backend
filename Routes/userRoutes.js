 const express = require("express");
 const router = express.Router();
 const {
   createUser,
   getUsers,
   getUserById,
   updateUser,
   loginUser,
   getAllMyOrders,
   addToCartProduct,
   getMyCartProducts,
   buyNow,
   buyFromCart,
   removeProductFromCart,  
 } = require("../Controllers/userController.js");
 const { validateUserToken } = require("../middlewares/authMiddleware.js");

 // User Routes
 router.post("/register", createUser);
 router.post("/login", loginUser);
 router.get("/", getUsers);
 router.get("/:id", getUserById);
 router.put("/:id", updateUser);

 // Cart Routes
//  router.post("/addToCart", validateUserToken, addToCartProduct);
//  router.delete("/removeFromCart", validateUserToken, removeProductFromCart); // Ensure delete method
//  router.get("/getMyCart", validateUserToken, getMyCartProducts);

//  // Order Routes
//  router.post("/buy-now", validateUserToken, buyNow);
//  router.post("/buy-from-cart", validateUserToken, buyFromCart);
//  router.get("/my-orders", validateUserToken, getAllMyOrders);

 module.exports = router;  
