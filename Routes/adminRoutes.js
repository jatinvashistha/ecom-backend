const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getAllUsers,
  deleteUser,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  getAllUsersOrdersByAdmin,
  changeOrderStatusByAdmin,
} = require("../Controllers/adminController.js");
const { validateTokenForRoles } = require("../middlewares/authMiddleware.js");  
const upload = require("../Utils/multer");  
const { validateUserToken } = require("../Utils/jwt.js");
const {
  getMyCartProducts,
  buyNow,
  buyFromCart,
  addToCartProduct,
  removeProductFromCart,
  getAllMyOrders,
} = require("../Controllers/userController");

router.post("/login", loginAdmin);
router.get("/users", getAllUsers);

router.delete("/user/:id", deleteUser);

router.post("/addProduct", upload.single("image"), addProduct);
router.put("/updateProduct/:id", upload.single("image"), updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getSingleProduct/:productId", getSingleProduct);

router.get("/getAllOrders", getAllUsersOrdersByAdmin);
router.put("/orderStatus", changeOrderStatusByAdmin);
 


// user routes are here
router.post("/addToCart", validateUserToken, addToCartProduct);
router.delete("/removeFromCart", validateUserToken, removeProductFromCart);  
router.get("/getMyCart", validateUserToken, getMyCartProducts);

// Order Routes
router.post("/buy-now", validateUserToken, buyNow);
router.post("/buy-from-cart", validateUserToken, buyFromCart);
router.get("/my-orders", validateUserToken, getAllMyOrders);

module.exports = router;
