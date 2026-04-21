import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/FoodRescue");
    console.log("Database Connected Successfully!");
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;