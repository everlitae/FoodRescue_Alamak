import express from 'express';
import mongoose from 'mongoose';
import connectDB from '../database/connect_db';
import userRoutes from '../backend/routes/userRoutes';

const app = express();
const PORT = 3000;
app.use(express.json());

connectDB();

app.post('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});