import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true, 
    },
      orginalPrice: {
      type: Number,
    },
    stock: { 
      type: Number, 
      required: true,
       default: 0 }, 
    quantity: {
      type: Number,
        },
    totalPrice: {
      type: Number,
      required: true,
    },

    photo: {
      type: [String], // Array of photo paths
    }
  , 
    price: {
      type: Number,
    },
    distance: {
      type: String,
    },
    catagory: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;