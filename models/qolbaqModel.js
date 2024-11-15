import mongoose from "mongoose";

const qolbaqModel = mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  thumbnail :{
    type: String,

  },
  photo: {
    type: String, // base64 encoded ucun string qebul edir
     
  },
  stock: { 
    type: Number, 
    required: true,
     default: 0 }, 
  price: {
    type: Number,
  },
  distance: {
    type: String,
  },
  catagory: {
    type: String,
  },
}, {
  timestamps: true
});

const QolbaqModel = mongoose.model("Qolbaq", qolbaqModel);

export default QolbaqModel;
