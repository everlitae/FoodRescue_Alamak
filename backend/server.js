process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/claims", require("./routes/claims"));
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/community", require("./routes/community"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/otp", require("./routes/otp"));
app.use("/api/contact", require("./routes/contact"));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
