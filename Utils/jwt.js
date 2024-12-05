require("dotenv").config();
 const jwt = require("jsonwebtoken");
 const User = require("../Models/userModel");
 const { errorResponse } = require("../Utils/resHandler");

  const validateUserToken = async (req, res, next) => {
   const token = req.header("Authorization");

   if (!token) {
     return errorResponse(res, "Access denied. No token provided.", 401);
   }

   try {
      const decoded = jwt.verify(
       token.replace("Bearer ", ""),
       process.env.JWT_SECRET
     );

      const user = await User.findById(decoded._id);
     if (!user) {
       return errorResponse(res, "Invalid token or user does not exist", 401);
     }

      req.user = user;

     next();
   } catch (error) {
     return errorResponse(res, "Invalid token", 401);
   }
 };

 // Middleware to verify JWT token and check user roles (admin, superAdmin, etc.)
 const validateTokenForRoles = (roles = []) => {
   return async (req, res, next) => {
     const token = req.header("Authorization");

     if (!token) {
       return errorResponse(res, "Access denied. No token provided.", 401);
     }

     try {
        const decoded = jwt.verify(
         token.replace("Bearer ", ""),
         process.env.JWT_SECRET
       );

        const user = await User.findById(decoded._id);
       if (!user) {
         return errorResponse(res, "Invalid token or user does not exist", 401);
       }

        if (roles.length && !roles.includes(user.role)) {
         return errorResponse(
           res,
           "Access denied. Insufficient permissions.",
           403
         );
       }

        req.user = user;

       next();
     } catch (error) {
       return errorResponse(res, "Invalid token", 401);
     }
   };
 };

 module.exports = {
   validateUserToken,  
   validateTokenForRoles,  
 };
