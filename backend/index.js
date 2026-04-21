import express from 'express';
import mongoose from 'mongoose';
import Users from '../database/Users';

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/FoodRescue")
    .then(() => console.log(`MongoDB Connected`))
    .catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})