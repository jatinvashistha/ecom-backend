const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8080;
const cors = require("cors");
const connectDB = require("./Utils/connectDB.js");
const bodyParser = require("body-parser");


// Middleware
app.use(express.json({}));


app.use(bodyParser.json()); // For application/json


app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


// Routes
  
app.use("/api/auth", require("./Routes/userRoutes.js"));
app.use("/api/admin", require("./Routes/adminRoutes.js"));
 
 

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "BBHK server is running" });
});



connectDB(process.env.MONGO_URI);
app.listen(port, () => {
  console.log(`Server Started... on port ${port}`);
});
