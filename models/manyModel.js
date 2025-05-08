import mongoose from "mongoose";

const manyModel = mongoose.Schema({
  titla: {
    type: String,
  },


 
}, {
  timestamps: true
});

const ManyModel = mongoose.model("Many", manyModel);

export default ManyModel;
