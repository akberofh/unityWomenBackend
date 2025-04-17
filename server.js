import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import todoRoutes from './routes/todoRoute.js';
import catagoryRoutes from './routes/catagoryRouter.js'
import qolbaqRoutes from './routes/qolbaqRoute.js';
import productRoutes from './routes/productRoute.js';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import ConfirmedCart from "./routes/confimerdCartRoute.js"
import cron from './cornJob/resertStock.js';
import mongoose from 'mongoose';
import paymentRoutes from './routes/paymentRoute.js'
import HesablamaRouter from './routes/hesabatRouter.js'
import QazancRouter from './routes/qazancRouter.js'


dotenv.config();


cron;

// Database connection (Ensure you connect to your DB before the app starts)
connectDB();


const app = express();
app.use(express.json());

app.use(cors({
  origin: 'https://unity-women.vercel.app',
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Define the Review schema and model before using it in the routes
const reviewSchema = new mongoose.Schema({
  rating: Number,
  review: String,
  name: String,
  email: String,
  catagory: String,
  // Corrected spelling: "catagory"
} ,{ timestamps: true });

const Review = mongoose.model('Review', reviewSchema); // Create the Review model

const PORT = process.env.PORT || 5000;



app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/catagory', catagoryRoutes);
app.use('/api', ConfirmedCart);
app.use('/api/qolbaq', qolbaqRoutes);
app.use('/api/product', productRoutes);
app.use('/api', HesablamaRouter);
app.use('/api', QazancRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome",
  });
});

// API route for posting reviews
app.post('/api/reviews', async (req, res) => {
  console.log('Request Body:', req.body);

  const { rating, review, name, email, catagory } = req.body;

  try {
    const newReview = new Review({ rating, review, name, email, catagory });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API route for getting reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API route for deleting a review by ID
app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: `Review with ID ${id} deleted successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/reviews/:catagory', async (req, res) => {
  const { catagory } = req.params;
  try {
    // RegExp kullanarak büyük/küçük harf duyarsız arama
    const filteredReviews = await Review.find({ 
      catagory: { $regex: new RegExp(`^${catagory}$`, 'i') } // 'i' harfi case-insensitive yapar
    });

    if (!filteredReviews.length) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    res.json({ reviews: filteredReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
