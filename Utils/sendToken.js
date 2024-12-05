 const sendToken = (res, user, message, statusCode = 200) => {
    const token = user.getJWTToken();

    res.status(statusCode).header("Authorization", `Bearer ${token}`).json({
     success: true,
     message,
     user,
     token,
   });
 };

 module.exports = {
   sendToken,
 };
