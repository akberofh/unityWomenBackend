import mongoose from "mongoose";

const kargoModel = mongoose.Schema({
  title: {
    type: String,
  },


 
}, {
  timestamps: true
});

const KargoModel = mongoose.model("Kargo", kargoModel);

export default KargoModel;
