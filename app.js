const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");

const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://varshamurugeshan:varshamrr@cluster0.gb2dd.mongodb.net//pets")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });


app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/pets", petRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});



app.listen(5000, () => {
  console.log("Server is running...");
  });
