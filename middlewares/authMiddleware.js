const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const { errorResponse } = require("../Utils/resHandler");

 
 const validateUserToken = async (req, res, next) => {
   let token = req.header("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
     return res
       .status(401)
       .json({ success: false, message: "Access denied. No token provided." });
   }

   try {
      token = token.replace("Bearer ", "");
     console.log(token, "the token is");

     const decoded = jwt.verify(token, process.env.JWT_SECRET);  

      if (!mongoose.Types.ObjectId.isValid(decoded._id)) {
       return res.status(401).json({
         success: false,
         message: "Invalid user ID in token",
       });
     }

      const user = await User.findById(decoded._id);
     if (!user) {
       return res.status(401).json({
         success: false,
         message: "Invalid token or user does not exist",
       });
     }

      req.user = user;

     next();
   } catch (error) {
     console.error("Token validation error:", error);
     return res.status(401).json({ success: false, message: "Invalid token" });
   }
 };

 const validateTokenForRoles = (roles = []) => {
   return async (req, res, next) => {
     const token = req.header("Authorization");

     if (!token) {
       return errorResponse(res, "Access denied. No token provided.", 401);
     }

     try {
        const tokenWithoutBearer = token.replace("Bearer ", "");

        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);  

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
       console.error(error);
       return errorResponse(res, "Invalid token", 401);  
     }
   };
 };

module.exports = {
  validateUserToken,
  validateTokenForRoles,  
};

 