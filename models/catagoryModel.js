import mongoose from "mongoose";

const catagoryModel = mongoose.Schema({
  title: {
    type: String,
    index: true, 
  },

  photo: {
    type: String, // base64 encoded ucun string qebul edir

  },

 
}, {
  timestamps: true
});

const CatagoryModel = mongoose.model("Catagory", catagoryModel);

export default CatagoryModel;
