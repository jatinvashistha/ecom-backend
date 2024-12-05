const mongoose = require("mongoose");
const connectDB = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error in connecting to database:", error);
  }
};

module.exports = connectDB;
