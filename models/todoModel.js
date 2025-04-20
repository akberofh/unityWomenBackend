import mongoose from "mongoose";

const todoSchema = mongoose.Schema(
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

    stock: {
      type: Number,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
      index: true, 
    },
    photo: {
      type: [String], // Array of photo paths
    }
  , 
    price: {
      type: Number,
      index: true, 
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

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;