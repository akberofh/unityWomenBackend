import mongoose from "mongoose";

const qolbaqModel = mongoose.Schema({
  title: {
    type: String,
    index: true, 
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String,

  },
 photo: {
    type: [String], // Array of photo paths
  }
,  
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
  },
  distance: {
    type: String,
  },
  catagory: {
    type: String,
    index: true, 
  },
}, {
  timestamps: true
});

const QolbaqModel = mongoose.model("Qolbaq", qolbaqModel);

qolbaqModel.index({ price: 1 });


export default QolbaqModel;
